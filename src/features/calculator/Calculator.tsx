import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";

import "./calculator.css";
import {
  PROJECT_TIP_ARROW_FILL_PATH,
  PROJECT_TIP_ARROW_SHADOW_PATH,
  copyTextToClipboard,
  ensureProjectTipGradient,
} from "../../scripts/project-tip";
import { calculateCalories } from "./domain/calculate";
import {
  ACTIVITY_OPTIONS,
  DEFAULT_CALCULATOR_INPUT,
  DIET_OPTIONS,
  FEMALE_BODY_FAT_OPTIONS,
  GENDER_OPTIONS,
  LEANGAINS_GOAL_OPTIONS,
  MALE_BODY_FAT_OPTIONS,
  MUSCLE_MASS_OPTIONS,
  STANDARD_GOAL_OPTIONS,
  STANDARD_PROTEIN_OPTIONS,
  UNIT_OPTIONS,
} from "./domain/constants";
import {
  centimetresToInches,
  convertHeightForDisplay,
  convertWeightForDisplay,
  inchesToCentimetres,
  kilogramsToPounds,
  poundsToKilograms,
} from "./domain/conversion";
import { calculatorModeFromSearch } from "./domain/query";
import type {
  CalculatorInput,
  DietMode,
  LeangainsGoal,
  MeasurementSystem,
  ValidationErrors,
} from "./domain/types";
import { CALCULATOR_BOUNDS } from "./domain/validation";

type NumericField =
  | "age"
  | "weight"
  | "height"
  | "activityMultiplier"
  | "standardGoalPercent"
  | "standardProteinPerPound"
  | "fatCaloriePercent"
  | "bodyFatModifier"
  | "muscleMassModifier"
  | "dailySteps"
  | "leangainsProteinPercent"
  | "ketoProteinPerPound"
  | "ketoCarbGrams";

type CalculatorFormState = Omit<CalculatorInput, NumericField> &
  Record<NumericField, string> & {
    // Calculations use canonical measurements so one-decimal display rounding
    // cannot change the physical input when the user switches units.
    canonicalHeightCm: number;
    canonicalWeightKg: number;
    femaleBodyFatModifier: string;
    femaleLeangainsGoal: LeangainsGoal;
    maleBodyFatModifier: string;
    maleLeangainsGoal: LeangainsGoal;
  };

interface CalculatorProps {
  initialMode?: DietMode;
}

interface HelpLink {
  sectionId: string;
  subject: string;
}

interface NumericInputProps {
  error?: string;
  help?: HelpLink;
  id: string;
  label: ReactNode;
  max: number;
  min: number;
  onChange: (value: string) => void;
  rangeLabel?: string;
  rangeTone?: "protein" | "split" | "steps";
  step?: number;
  suffix?: string;
  showRange?: boolean;
  value: string;
}

function NumericInput({
  error,
  help,
  id,
  label,
  max,
  min,
  onChange,
  rangeLabel,
  rangeTone = "split",
  step = 1,
  suffix,
  showRange = false,
  value,
}: NumericInputProps) {
  const errorId = `${id}-error`;
  const rangeProgress = Math.min(
    100,
    Math.max(0, ((Number(value) - min) / (max - min)) * 100),
  );
  const rangeStyle = {
    "--calculator-range-progress": `${rangeProgress}%`,
  } as CSSProperties;

  return (
    <div className="calculator-field">
      {help ? (
        <FieldLabel help={help} htmlFor={id}>{label}</FieldLabel>
      ) : (
        <label htmlFor={id}>{label}</label>
      )}
      {showRange ? (
        <>
          <input
            aria-describedby={`${id}-range-value`}
            aria-label={rangeLabel ?? `${String(label)} slider`}
            className={`calculator-range calculator-range--${rangeTone}`}
            max={max}
            min={min}
            onChange={(event) => onChange(event.currentTarget.value)}
            step={step}
            type="range"
            value={value}
            style={rangeStyle}
          />
          <span className="calculator-range-value" id={`${id}-range-value`} role="tooltip">
            {value}{suffix ? ` ${suffix}` : ''}
          </span>
        </>
      ) : null}
      <div className="calculator-input-group">
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-label={String(label).replace(/:$/, "")}
          id={id}
          inputMode="decimal"
          max={max}
          min={min}
          onChange={(event) => onChange(event.currentTarget.value)}
          step={step}
          type="number"
          value={value}
        />
        {suffix ? (
          <span
            aria-hidden="true"
            className={suffix.startsWith("%") ? "calculator-input-group-std" : undefined}
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="calculator-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function InfoMark({
  sectionId,
  subject,
}: HelpLink) {
  return (
    <a
      aria-label={`Learn more about ${subject}`}
      className="calculator-info-mark"
      href={`#${sectionId}`}
      title={`Open the ${subject} guide`}
    >
      <img alt="" aria-hidden="true" height="18" src="/img/info.png" width="18" />
      {/* Legacy vue-popper copy: the visible label never carried the subject. */}
      <span className="calculator-info-tooltip" role="tooltip">
        Click for more info
      </span>
    </a>
  );
}

function FieldLabel({
  children,
  help,
  htmlFor,
}: {
  children: ReactNode;
  help: HelpLink;
  htmlFor: string;
}) {
  return (
    <div className="calculator-field-label">
      <label htmlFor={htmlFor}>{children}</label>
      <InfoMark sectionId={help.sectionId} subject={help.subject} />
    </div>
  );
}

function createFormState(initialMode: DietMode): CalculatorFormState {
  return {
    ...DEFAULT_CALCULATOR_INPUT,
    mode: initialMode,
    canonicalHeightCm: DEFAULT_CALCULATOR_INPUT.height,
    canonicalWeightKg: DEFAULT_CALCULATOR_INPUT.weight,
    femaleBodyFatModifier: String(DEFAULT_CALCULATOR_INPUT.bodyFatModifier),
    femaleLeangainsGoal: DEFAULT_CALCULATOR_INPUT.leangainsGoal,
    maleBodyFatModifier: String(DEFAULT_CALCULATOR_INPUT.bodyFatModifier),
    maleLeangainsGoal: DEFAULT_CALCULATOR_INPUT.leangainsGoal,
    age: String(DEFAULT_CALCULATOR_INPUT.age),
    weight: String(DEFAULT_CALCULATOR_INPUT.weight),
    height: String(DEFAULT_CALCULATOR_INPUT.height),
    activityMultiplier: String(DEFAULT_CALCULATOR_INPUT.activityMultiplier),
    standardGoalPercent: String(DEFAULT_CALCULATOR_INPUT.standardGoalPercent),
    standardProteinPerPound: String(
      DEFAULT_CALCULATOR_INPUT.standardProteinPerPound,
    ),
    fatCaloriePercent: String(DEFAULT_CALCULATOR_INPUT.fatCaloriePercent),
    bodyFatModifier: String(DEFAULT_CALCULATOR_INPUT.bodyFatModifier),
    muscleMassModifier: String(DEFAULT_CALCULATOR_INPUT.muscleMassModifier),
    dailySteps: String(DEFAULT_CALCULATOR_INPUT.dailySteps),
    leangainsProteinPercent: String(
      DEFAULT_CALCULATOR_INPUT.leangainsProteinPercent,
    ),
    ketoProteinPerPound: String(DEFAULT_CALCULATOR_INPUT.ketoProteinPerPound),
    ketoCarbGrams: String(DEFAULT_CALCULATOR_INPUT.ketoCarbGrams),
  };
}

function parseNumericFormValue(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function toCalculatorInput(form: CalculatorFormState): CalculatorInput {
  const {
    canonicalHeightCm,
    canonicalWeightKg,
    femaleBodyFatModifier,
    femaleLeangainsGoal,
    maleBodyFatModifier,
    maleLeangainsGoal,
    ...displayForm
  } = form;

  return {
    ...displayForm,
    age: parseNumericFormValue(form.age),
    weight:
      form.units === "metric"
        ? canonicalWeightKg
        : kilogramsToPounds(canonicalWeightKg),
    height:
      form.units === "metric"
        ? canonicalHeightCm
        : centimetresToInches(canonicalHeightCm),
    activityMultiplier: parseNumericFormValue(form.activityMultiplier),
    standardGoalPercent: parseNumericFormValue(form.standardGoalPercent),
    standardProteinPerPound: parseNumericFormValue(
      form.standardProteinPerPound,
    ),
    fatCaloriePercent: parseNumericFormValue(form.fatCaloriePercent),
    bodyFatModifier: parseNumericFormValue(form.bodyFatModifier),
    muscleMassModifier: parseNumericFormValue(form.muscleMassModifier),
    dailySteps: parseNumericFormValue(form.dailySteps),
    leangainsProteinPercent: parseNumericFormValue(
      form.leangainsProteinPercent,
    ),
    ketoProteinPerPound: parseNumericFormValue(form.ketoProteinPerPound),
    ketoCarbGrams: parseNumericFormValue(form.ketoCarbGrams),
  };
}

/* Retained legacy `#icon-twit` and `#icon-book` symbol paths from calorie-calculator/index.html. */
const TWITTER_ICON_PATH =
  "M925.714 233.143q-38.286 56-92.571 95.429 0.571 8 0.571 24 0 74.286-21.714 148.286t-66 142-105.429 120.286-147.429 83.429-184.571 31.143q-154.857 0-283.429-82.857 20 2.286 44.571 2.286 128.571 0 229.143-78.857-60-1.143-107.429-36.857t-65.143-91.143q18.857 2.857 34.857 2.857 24.571 0 48.571-6.286-64-13.143-106-63.714t-42-117.429v-2.286q38.857 21.714 83.429 23.429-37.714-25.143-60-65.714t-22.286-88q0-50.286 25.143-93.143 69.143 85.143 168.286 136.286t212.286 56.857q-4.571-21.714-4.571-42.286 0-76.571 54-130.571t130.571-54q80 0 134.857 58.286 62.286-12 117.143-44.571-21.143 65.714-81.143 101.714 53.143-5.714 106.286-28.571z";
const FACEBOOK_ICON_PATH =
  "M548 6.857v150.857h-89.714q-49.143 0-66.286 20.571t-17.143 61.714v108h167.429l-22.286 169.143h-145.143v433.714h-174.857v-433.714h-145.714v-169.143h145.714v-124.571q0-106.286 59.429-164.857t158.286-58.571q84 0 130.286 6.857z";

function firstError(errors: ValidationErrors): string | undefined {
  return Object.values(errors).find((message) => message !== undefined);
}

function formatWeeklyChange(value: number): string {
  if (value === 0) return "-0";
  if (value > 0) return `+${value}`;
  return String(value);
}

/**
 * Production-equivalent tippy tooltip rendered inline next to the copy control.
 * The DOM shape mirrors `src/scripts/project-tip.ts` so the heading self-links
 * and this control share the muscle theme, arrow, and shift-toward-extreme motion.
 */
function ProjectTip({
  id,
  label,
  placement,
  role,
  visible,
}: {
  id: string;
  label: string;
  placement: "top" | "right";
  role: "tooltip" | "status";
  visible: boolean;
}) {
  return (
    <span className={`project-tip-root calculator-copy-tip calculator-copy-tip--${placement}`} id={id}>
      <span
        className="project-tip-box"
        data-placement={placement}
        data-state={visible ? "visible" : "hidden"}
        data-theme="muscle"
        role={role}
      >
        <span className="project-tip-content">{label}</span>
        <span aria-hidden="true" className="project-tip-arrow project-popover-arrow">
          <svg height="6" width="16">
            <path className="svg-arrow" d={PROJECT_TIP_ARROW_SHADOW_PATH} />
            <path className="svg-content" d={PROJECT_TIP_ARROW_FILL_PATH} />
          </svg>
        </span>
      </span>
    </span>
  );
}

export default function Calculator({
  initialMode = "standard",
}: CalculatorProps) {
  const [form, setForm] = useState<CalculatorFormState>(() =>
    createFormState(initialMode),
  );
  const [copyStatus, setCopyStatus] = useState("");
  const [copyHintVisible, setCopyHintVisible] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<{ label: string; visible: boolean }>({
    label: "Copied!",
    visible: false,
  });
  const copyAttemptRef = useRef(0);
  const copyHintTimerRef = useRef(0);
  const copyFeedbackTimerRef = useRef(0);
  const input = useMemo(() => toCalculatorInput(form), [form]);
  const calculation = useMemo(() => calculateCalories(input), [input]);
  const errors = calculation.ok ? {} : calculation.errors;
  const bodyFatOptions =
    form.gender === "male"
      ? MALE_BODY_FAT_OPTIONS
      : FEMALE_BODY_FAT_OPTIONS;
  const weightBounds =
    form.units === "metric"
      ? CALCULATOR_BOUNDS.weightKg
      : CALCULATOR_BOUNDS.weightLb;
  const heightBounds =
    form.units === "metric"
      ? CALCULATOR_BOUNDS.heightCm
      : CALCULATOR_BOUNDS.heightIn;

  useEffect(() => {
    const queryMode = calculatorModeFromSearch(window.location.search);

    updateForm((current) =>
      current.mode === queryMode ? current : { ...current, mode: queryMode },
    );
    ensureProjectTipGradient();

    return () => {
      window.clearTimeout(copyHintTimerRef.current);
      window.clearTimeout(copyFeedbackTimerRef.current);
    };
  }, []);

  /* Production copy control: a hover tippy ("Click to Copy (reddit-style
     markdown)", placement right, 50ms delay) and a separate click tippy
     ("Copied!", placement top) that enters fresh, holds, then hides itself. */
  function showCopyHint(): void {
    window.clearTimeout(copyHintTimerRef.current);
    copyHintTimerRef.current = window.setTimeout(() => setCopyHintVisible(true), 50);
  }

  function hideCopyHint(): void {
    window.clearTimeout(copyHintTimerRef.current);
    setCopyHintVisible(false);
  }

  function hideCopyFeedback(): void {
    window.clearTimeout(copyFeedbackTimerRef.current);
    copyFeedbackTimerRef.current = 0;
    setCopyFeedback((current) => ({ ...current, visible: false }));
  }

  function showCopyFeedback(label: string, holdMs: number): void {
    window.clearTimeout(copyFeedbackTimerRef.current);
    setCopyFeedback({ label, visible: true });
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      copyFeedbackTimerRef.current = 0;
      setCopyFeedback((current) => ({ ...current, visible: false }));
    }, holdMs);
  }

  function updateForm(
    updater: (current: CalculatorFormState) => CalculatorFormState,
  ): void {
    copyAttemptRef.current += 1;
    setCopyStatus("");
    setForm(updater);
  }

  function updateNumeric(field: NumericField, value: string): void {
    updateForm((current) => {
      if (field === "weight") {
        return {
          ...current,
          weight: value,
          canonicalWeightKg:
            current.units === "metric"
              ? Number(value)
              : poundsToKilograms(Number(value)),
        };
      }

      if (field === "height") {
        return {
          ...current,
          height: value,
          canonicalHeightCm:
            current.units === "metric"
              ? Number(value)
              : inchesToCentimetres(Number(value)),
        };
      }

      return { ...current, [field]: value };
    });
  }

  function updateUnits(event: ChangeEvent<HTMLSelectElement>): void {
    const units = event.currentTarget.value as MeasurementSystem;

    updateForm((current) => {
      if (current.units === units) return current;

      const weight =
        units === "imperial"
          ? convertWeightForDisplay(
              current.canonicalWeightKg,
              "metric-to-imperial",
            )
          : convertWeightForDisplay(Number(current.weight), "imperial-to-metric");
      const metricWeightBounds = CALCULATOR_BOUNDS.weightKg;
      const roundedWeightCrossesMetricBoundary =
        units === "metric" &&
        weight >= metricWeightBounds.min &&
        weight <= metricWeightBounds.max &&
        (current.canonicalWeightKg < metricWeightBounds.min ||
          current.canonicalWeightKg > metricWeightBounds.max);

      return {
        ...current,
        units,
        // Keep the exact canonical value unless conversion rounding moves an
        // accepted imperial boundary onto the visible metric boundary.
        canonicalWeightKg: roundedWeightCrossesMetricBoundary
          ? weight
          : current.canonicalWeightKg,
        weight: String(weight),
        height: String(
          units === "imperial"
            ? convertHeightForDisplay(
                current.canonicalHeightCm,
                "metric-to-imperial",
              )
            : convertHeightForDisplay(Number(current.height), "imperial-to-metric"),
        ),
      };
    });
  }

  async function copyResults(): Promise<void> {
    if (!calculation.ok) return;
    const copyCalculatorText = copyTextToClipboard;

    const copyAttempt = ++copyAttemptRef.current;
    setCopyStatus("");

    const result = calculation.value;
    const bmrLine = result.bmr === null ? "" : `Your BMR is equal to ${result.bmr}\n\n`;
    const text = `${bmrLine}Your TDEE is equal to ${result.tdee}\n\nCalories|Protein|Fat|Carbs\n|:-:|:-:|:-:|:-:|\n${result.calories}|${result.protein}|${result.fat}|${result.carbs}|\n\nEstimated ${formatWeeklyChange(result.weeklyChange)} ${result.weeklyChangeUnit} per week`;

    /* Like production, the hover tooltip hides on click while the copied-state
       tooltip enters fresh with the same shift-toward-extreme motion. */
    hideCopyHint();
    hideCopyFeedback();

    try {
      await copyCalculatorText(text);
      if (copyAttempt !== copyAttemptRef.current) return;
      setCopyStatus("Results copied.");
      showCopyFeedback("Copied!", 750);
    } catch {
      if (copyAttempt !== copyAttemptRef.current) return;
      setCopyStatus("Could not copy results. Please try again.");
      showCopyFeedback("Copy Failed", 1_000);
    }
  }

  return (
    <section
      aria-labelledby="calculator-heading"
      className={`calculator-shell calculator-shell--${form.mode}`}
    >
      <div className="calculator-title-row">
        <h1 id="calculator-heading">
          Calorie And Macro Calculator (Bulking, Maintenance or Cutting)
        </h1>
      </div>

      <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
        <div className="calculator-mode-row">
          <div className="calculator-field">
            <FieldLabel help={{ sectionId: "diet", subject: "Diet" }} htmlFor="calculator-diet">
              Diet
            </FieldLabel>
            <select
              id="calculator-diet"
              onChange={(event) => {
                const mode = event.currentTarget.value as DietMode;
                updateForm((current) => ({
                  ...current,
                  mode,
                }));
              }}
              value={form.mode}
            >
              {DIET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="calculator-field">
            <label htmlFor="calculator-units">Units</label>
            <select id="calculator-units" onChange={updateUnits} value={form.units}>
              {UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calculator-columns">
          <fieldset className="calculator-panel">
            <legend>
              Stats {form.mode !== "leangains" ? <InfoMark sectionId="stats" subject="Stats" /> : null}
            </legend>
            <NumericInput
              error={errors.age}
              help={
                form.mode === "leangains"
                  ? { sectionId: "age", subject: "Age" }
                  : undefined
              }
              id="calculator-age"
              label="Age:"
              max={CALCULATOR_BOUNDS.age.max}
              min={CALCULATOR_BOUNDS.age.min}
              onChange={(value) => updateNumeric("age", value)}
              value={form.age}
            />
            <NumericInput
              error={errors.weight}
              help={
                form.mode === "leangains"
                  ? {
                      sectionId: "the-leangains-method",
                      subject: "Weight",
                    }
                  : undefined
              }
              id="calculator-weight"
              label="Weight:"
              max={weightBounds.max}
              min={weightBounds.min}
              onChange={(value) => updateNumeric("weight", value)}
              step={0.1}
              suffix={form.units === "metric" ? "kg" : "lb"}
              value={form.weight}
            />
            <NumericInput
              error={errors.height}
              help={
                form.mode === "leangains"
                  ? { sectionId: "height", subject: "Height" }
                  : undefined
              }
              id="calculator-height"
              label="Height:"
              max={heightBounds.max}
              min={heightBounds.min}
              onChange={(value) => updateNumeric("height", value)}
              step={0.1}
              suffix={form.units === "metric" ? "cm" : "in"}
              value={form.height}
            />

            <fieldset className="calculator-choice-group">
              <legend>Gender:</legend>
              <div className="calculator-segmented">
                {GENDER_OPTIONS.map((option) => (
                  <label key={option.value}>
                    <input
                      checked={form.gender === option.value}
                      name="calculator-gender"
                      onChange={() =>
                        updateForm((current) => ({
                          ...current,
                          gender: option.value,
                          bodyFatModifier:
                            option.value === "male"
                              ? current.maleBodyFatModifier
                              : current.femaleBodyFatModifier,
                          leangainsGoal:
                            option.value === "male"
                              ? current.maleLeangainsGoal
                              : current.femaleLeangainsGoal,
                        }))
                      }
                      type="radio"
                      value={option.value}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {form.mode === "leangains" ? (
              <>
                <div className="calculator-field">
                  <FieldLabel
                    help={{ sectionId: "body-fat", subject: "Body Fat" }}
                    htmlFor="calculator-body-fat"
                  >
                    Body Fat:
                  </FieldLabel>
                  <select
                    id="calculator-body-fat"
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      updateForm((current) => ({
                        ...current,
                        bodyFatModifier: value,
                        [current.gender === "male" ? "maleBodyFatModifier" : "femaleBodyFatModifier"]:
                          value,
                      }));
                    }}
                    value={form.bodyFatModifier}
                  >
                    {bodyFatOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="calculator-field-help">
                    (test this with <a href="https://geni.us/body-fat" rel="nofollow noopener" target="_blank">calipers</a>)
                  </p>
                </div>
                <div className="calculator-field">
                  <FieldLabel
                    help={{ sectionId: "muscle-mass", subject: "Muscle Mass" }}
                    htmlFor="calculator-muscle-mass"
                  >
                    Muscle Mass:
                  </FieldLabel>
                  <select
                    id="calculator-muscle-mass"
                    onChange={(event) =>
                      updateNumeric("muscleMassModifier", event.currentTarget.value)
                    }
                    value={form.muscleMassModifier}
                  >
                    {MUSCLE_MASS_OPTIONS.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
          </fieldset>

          <fieldset className="calculator-panel">
            <legend>Modifiers</legend>
            {form.mode === "leangains" ? (
              <>
                <div className="calculator-field">
                  <FieldLabel
                    help={{
                      sectionId: "goal-leangains",
                      subject: "Leangains Goal",
                    }}
                    htmlFor="calculator-lg-goal"
                  >
                    Goal:
                  </FieldLabel>
                  <select
                    id="calculator-lg-goal"
                    onChange={(event) => {
                      const value = event.currentTarget.value as LeangainsGoal;
                      updateForm((current) => ({
                        ...current,
                        leangainsGoal: value,
                        [current.gender === "male" ? "maleLeangainsGoal" : "femaleLeangainsGoal"]:
                          value,
                      }));
                    }}
                    value={form.leangainsGoal}
                  >
                    {LEANGAINS_GOAL_OPTIONS.map((option) => {
                      const amount = form.gender === "male" ? 500 : 350;
                      const detail =
                        option.value === "maintain"
                          ? ""
                          : ` (${option.value === "lose" ? "–" : "+"}${amount} cal)`;
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                          {detail}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <NumericInput
                  error={errors.dailySteps}
                  help={{ sectionId: "steps", subject: "Steps" }}
                  id="calculator-steps"
                  label="Steps:"
                  max={CALCULATOR_BOUNDS.dailySteps.max}
                  min={CALCULATOR_BOUNDS.dailySteps.min}
                  onChange={(value) => updateNumeric("dailySteps", value)}
                  rangeLabel="Daily steps slider"
                  rangeTone="steps"
                  showRange
                  step={500}
                  suffix="per day"
                  value={form.dailySteps}
                />
                <NumericInput
                  error={errors.leangainsProteinPercent}
                  help={{
                    sectionId: "how-much-protein-leangains",
                    subject: "Leangains Protein",
                  }}
                  id="calculator-lg-protein"
                  label="How Much Protein?"
                  max={CALCULATOR_BOUNDS.leangainsProteinPercent.max}
                  min={CALCULATOR_BOUNDS.leangainsProteinPercent.min}
                  onChange={(value) =>
                    updateNumeric("leangainsProteinPercent", value)
                  }
                  rangeLabel="Protein percentage slider"
                  rangeTone="protein"
                  showRange
                  suffix="% protein"
                  value={form.leangainsProteinPercent}
                />
                <NumericInput
                  error={errors.fatCaloriePercent}
                  help={{
                    sectionId: "fat-carb-calorie-split",
                    subject: "Fat/Carb Calorie Split",
                  }}
                  id="calculator-fat-split"
                  label="Fat/Carb Calorie Split:"
                  max={CALCULATOR_BOUNDS.fatCaloriePercent.max}
                  min={CALCULATOR_BOUNDS.fatCaloriePercent.min}
                  onChange={(value) => updateNumeric("fatCaloriePercent", value)}
                  rangeLabel="Fat and carbohydrate calorie split slider"
                  suffix="% fat"
                  showRange
                  value={form.fatCaloriePercent}
                />
              </>
            ) : (
              <>
                <div className="calculator-field">
                  <FieldLabel
                    help={{
                      sectionId: "activity-level",
                      subject: "Activity Level",
                    }}
                    htmlFor="calculator-activity"
                  >
                    Activity Level:
                  </FieldLabel>
                  <select
                    id="calculator-activity"
                    onChange={(event) =>
                      updateNumeric("activityMultiplier", event.currentTarget.value)
                    }
                    value={form.activityMultiplier}
                  >
                    {ACTIVITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="calculator-field">
                  <FieldLabel
                    help={{ sectionId: "goal", subject: "Goal" }}
                    htmlFor="calculator-goal"
                  >
                    Goal:
                  </FieldLabel>
                  <select
                    id="calculator-goal"
                    onChange={(event) =>
                      updateNumeric("standardGoalPercent", event.currentTarget.value)
                    }
                    value={form.standardGoalPercent}
                  >
                    {STANDARD_GOAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <NumericInput
                  error={errors.standardGoalPercent}
                  id="calculator-calorie-adjustment"
                  label="Calorie Deficit/Surplus:"
                  max={CALCULATOR_BOUNDS.standardGoalPercent.max}
                  min={CALCULATOR_BOUNDS.standardGoalPercent.min}
                  onChange={(value) => updateNumeric("standardGoalPercent", value)}
                  suffix="%"
                  value={form.standardGoalPercent}
                />

                {form.mode === "standard" ? (
                  <>
                    <div className="calculator-field">
                      <FieldLabel
                        help={{
                          sectionId: "how-much-protein",
                          subject: "How Much Protein",
                        }}
                        htmlFor="calculator-standard-protein"
                      >
                        How Much Protein?
                      </FieldLabel>
                      <select
                        id="calculator-standard-protein"
                        onChange={(event) =>
                          updateNumeric(
                            "standardProteinPerPound",
                            event.currentTarget.value,
                          )
                        }
                        value={form.standardProteinPerPound}
                      >
                        {STANDARD_PROTEIN_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <NumericInput
                      error={errors.fatCaloriePercent}
                      help={{
                        sectionId: "fat-carb-calorie-split",
                        subject: "Fat/Carb Calorie Split",
                      }}
                      id="calculator-fat-split"
                      label="Fat/Carb Calorie Split:"
                      max={CALCULATOR_BOUNDS.fatCaloriePercent.max}
                      min={CALCULATOR_BOUNDS.fatCaloriePercent.min}
                      onChange={(value) =>
                        updateNumeric("fatCaloriePercent", value)
                      }
                      rangeLabel="Fat and carbohydrate calorie split slider"
                      suffix="% fat"
                      showRange
                      value={form.fatCaloriePercent}
                    />
                  </>
                ) : (
                  <>
                    <NumericInput
                      error={errors.ketoProteinPerPound}
                      id="calculator-keto-protein"
                      label="How Much Protein?"
                      max={CALCULATOR_BOUNDS.ketoProteinPerPound.max}
                      min={CALCULATOR_BOUNDS.ketoProteinPerPound.min}
                      onChange={(value) =>
                        updateNumeric("ketoProteinPerPound", value)
                      }
                      rangeLabel="Protein per pound slider"
                      rangeTone="protein"
                      showRange
                      step={0.1}
                      suffix="g per pound"
                      value={form.ketoProteinPerPound}
                    />
                    <NumericInput
                      error={errors.ketoCarbGrams}
                      id="calculator-keto-carbs"
                      label="Carb Limit:"
                      max={CALCULATOR_BOUNDS.ketoCarbGrams.max}
                      min={CALCULATOR_BOUNDS.ketoCarbGrams.min}
                      onChange={(value) => updateNumeric("ketoCarbGrams", value)}
                      suffix="g of carbs"
                      value={form.ketoCarbGrams}
                    />
                  </>
                )}
              </>
            )}
          </fieldset>

          <section aria-live="polite" className="calculator-results">
            <div className="calculator-results-heading">
              <h3>Results</h3>{" "}
              {/* Legacy: `<span data-toggle="tooltip" data-placement="right">` wrapping `#copyB`. */}
              <span className="calculator-copy-control">
                <button
                  aria-controls="calculator-copy-hint"
                  aria-describedby="calculator-copy-hint"
                  aria-expanded={copyHintVisible}
                  aria-label="Copy"
                  disabled={!calculation.ok}
                  id="copyB"
                  onBlur={() => {
                    hideCopyHint();
                    hideCopyFeedback();
                  }}
                  onClick={copyResults}
                  onFocus={showCopyHint}
                  onKeyDown={(event) => {
                    if (event.key !== "Escape") return;
                    hideCopyHint();
                    hideCopyFeedback();
                  }}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "touch") showCopyHint();
                  }}
                  onPointerLeave={hideCopyHint}
                  type="button"
                >
                  <svg aria-hidden="true" viewBox="0 0 14 16">
                    <path d="M2 13h4v1H2v-1Zm5-6H2v1h5V7Zm2 3V8l-3 3 3 3v-2h5v-2H9ZM4.5 9H2v1h2.5V9ZM2 12h2.5v-1H2v1Zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2s2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2ZM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1Z" />
                  </svg>
                </button>
                <ProjectTip
                  id="calculator-copy-hint"
                  label="Click to Copy (reddit-style markdown)"
                  placement="right"
                  role="tooltip"
                  visible={copyHintVisible}
                />
                <ProjectTip
                  id="calculator-copy-feedback"
                  label={copyFeedback.label}
                  placement="top"
                  role="status"
                  visible={copyFeedback.visible}
                />
              </span>
            </div>
            {calculation.ok ? (
              <>
                <dl className="calculator-energy">
                  {calculation.value.bmr !== null ? (
                    <div>
                      <dt>
                        Your BMR is
                      </dt>
                      <dd>
                        <span>{calculation.value.bmr} cal</span>{" "}
                        <InfoMark sectionId="bmr" subject="BMR" />
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>
                      Your TDEE is
                    </dt>
                    <dd>
                      <span>{calculation.value.tdee} cal</span>{" "}
                      <InfoMark sectionId="tdee" subject="TDEE" />
                    </dd>
                  </div>
                </dl>
                <table>
                  <caption>
                    Daily Calories and Macros{" "}
                    <InfoMark
                      sectionId="daily-calories-and-macros"
                      subject="Daily Calories and Macros"
                    />
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Calories</th>
                      <th scope="col">Protein</th>
                      <th scope="col">Fat</th>
                      <th scope="col">Carbs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{calculation.value.calories}</td>
                      <td>{calculation.value.protein}</td>
                      <td>{calculation.value.fat}</td>
                      <td>{calculation.value.carbs}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="calculator-change">
                  Estimated {formatWeeklyChange(calculation.value.weeklyChange)}{" "}
                  {calculation.value.weeklyChangeUnit} per week{" "}
                  <InfoMark
                    sectionId="estimated-weight-loss-per-week"
                    subject="Estimated Weight Change per Week"
                  />
                </p>
                <div className="calculator-share">
                  <p>If You Found This Tool Useful, Please<br />Consider Sharing It</p>
                  <div>
                    <a aria-label="Share on Twitter" href="https://twitter.com/intent/tweet?text=Check+out+this+calorie+and+macro+calculator:+https://www.musclehacking.com/calorie-calculator/%20from%20@musclehacking" rel="noopener nofollow" target="_blank" title="Share on Twitter">
                      <svg aria-hidden="true" className="icon twit" viewBox="0 0 951 1024"><path d={TWITTER_ICON_PATH} /></svg>
                    </a>{" "}
                    <a aria-label="Share on Facebook" href="https://www.facebook.com/sharer/sharer.php?u=https://www.musclehacking.com/calorie-calculator/" rel="noopener nofollow" target="_blank" title="Share on Facebook">
                      <svg aria-hidden="true" className="icon" id="face" viewBox="0 0 585 1024"><path d={FACEBOOK_ICON_PATH} /></svg>
                    </a>
                  </div>
                </div>
                <p className="calculator-copy-status visually-hidden" role="status">
                  {copyStatus}
                </p>
              </>
            ) : (
              <div className="calculator-error-summary" role="alert">
                <strong>Check your inputs.</strong>
                <p>{firstError(calculation.errors)}</p>
              </div>
            )}
          </section>
        </div>
      </form>
      <noscript>
        The calculator needs JavaScript for interactive results. The default Standard
        example uses age 25, 80 kg, 180 cm, male, and Sedentary activity.
      </noscript>
    </section>
  );
}
