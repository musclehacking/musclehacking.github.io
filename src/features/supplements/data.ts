import type {
  EvidenceLevel,
  SupplementCategory,
  SupplementFilter,
  SupplementRecord,
} from "./types";

export const evidenceRank = {
  low: 1,
  medium: 2,
  high: 3,
} as const satisfies Record<EvidenceLevel, number>;

export const supplementCategories = [
  { id: "muscle", label: "Muscle Growth" },
  { id: "power-output", label: "Power Output" },
  { id: "sleep", label: "Sleep" },
  { id: "joints", label: "Joint Health" },
  { id: "bone", label: "Bone Health" },
  { id: "test", label: "Testosterone" },
  { id: "focus", label: "Focus" },
  { id: "brain-function", label: "Brain Function" },
  { id: "insulin-sensitivity", label: "Insulin Sensitivity" },
  { id: "glucose-control", label: "Glucose Control" },
  { id: "longevity", label: "Longevity" },
  { id: "mood", label: "Mood" },
  { id: "relaxation", label: "Relaxation" },
  { id: "cholesterol", label: "Cholesterol" },
  { id: "skin", label: "Skin" },
  { id: "gut-health", label: "Gut Health" },
  { id: "immune", label: "Immune" },
  { id: "blood-pressure", label: "Blood Pressure" },
  { id: "fatty-liver", label: "Fatty Liver" },
  { id: "cardiovascular-health", label: "Cardiovascular Health" },
] as const satisfies readonly SupplementCategory[];

export const supplementFilters = [
  {
    id: "muscle-growth",
    label: "Muscle Growth",
    categories: ["muscle", "power-output"],
    notice: {
      title: "Note",
      text: "This category includes includes supplements that increase either muscle growth or power output.",
    },
  },
  { id: "sleep", label: "Sleep", categories: ["sleep"] },
  { id: "joint-health", label: "Joint Health", categories: ["joints"] },
  { id: "bone-health", label: "Bone Health", categories: ["bone"] },
  {
    id: "testosterone",
    label: "Testosterone",
    categories: ["test"],
    notice: {
      title: "Important",
      text: "Zinc and magnesium supplements may contribute to normalizing testosterone levels only if there is an underlying deficiency in these minerals. Supplementing with these minerals in the absence of a deficiency has not been shown to improve testosterone levels.",
    },
  },
  { id: "focus", label: "Focus", categories: ["focus"] },
  {
    id: "brain-function",
    label: "Brain Function",
    categories: ["brain-function"],
  },
  {
    id: "insulin-sensitivity",
    label: "Insulin Sensitivity",
    categories: ["insulin-sensitivity", "glucose-control"],
    notice: {
      title: "Note",
      text: "This category includes includes supplements that improve either insulin sensitivity or glucose control.",
    },
  },
  { id: "longevity", label: "Longevity", categories: ["longevity"] },
  { id: "show-all", label: "Show All", categories: [], showAll: true },
  { id: "information", label: "What is this?", categories: [] },
] as const satisfies readonly SupplementFilter[];

/**
 * The order, names, summaries, links, and evidence pairs below are transcribed
 * from the category elements in supplements/index.html at baseline 9bf25d0.
 */
export const supplements = [
  {
    id: "creatine",
    name: "Creatine",
    sourceOrder: 0,
    description:
      "Creatine is a molecule produced in the body that plays a key role in energy production during high-intensity activity. It is well-researched and effective for improving strength, power output, and lean mass during resistance exercise. Creatine may also provide cognitive benefits, but more research is needed in that area.",
    evidence: [
      { category: "brain-function", level: "medium" },
      { category: "muscle", level: "high" },
    ],
    recommendedSupplementUrl: "https://geni.us/creatine-mono",
    referencesAnchor: "#creatine-references",
  },
  {
    id: "beta-alanine",
    name: "Beta-Alanine",
    sourceOrder: 1,
    description:
      "Beta-alanine is a nonproteinogenic amino acid synthesized in the liver and found in animal-based foods. It enhances muscular endurance during high-intensity exercise and may exert antiaging effects. Large doses may cause a harmless tingling feeling called paresthesia[3].",
    evidence: [
      { category: "longevity", level: "low" },
      { category: "muscle", level: "medium" },
    ],
    recommendedSupplementUrl: "https://geni.us/Beta-alanine",
    referencesAnchor: "#beta-alanine-references",
  },
  {
    id: "whey-protein",
    name: "Whey Protein",
    sourceOrder: 2,
    description:
      "Whey protein is a collection of proteins found in whey, a byproduct of cheesemaking. It’s a high-quality, well-absorbed source of protein that’s very useful for hitting targeted daily protein goals. Its benefits extend to the benefits of increased protein intake in general, such as augmenting muscle gain, limiting muscle loss during low-calorie diets, and modestly limiting fat gain during periods of excessive calorie intake.",
    evidence: [{ category: "muscle", level: "high" }],
    recommendedSupplementUrl: "https://geni.us/whey-protein",
  },
  {
    id: "alpha-gpc",
    name: "Alpha GPC",
    sourceOrder: 3,
    description:
      "Alpha-GPC is a cholinergic compound that is used for cognitive-enhancement and to increase power output in athletes[4]. It supports cellular membranes[1] and may help prevent cognitive decline[3]. It is rapidly absorbed and crosses the blood-brain barrier easily[2]. While it is generally well-tolerated, recent studies suggest a potential increased risk of cardiovascular disease with long-term use[7][8][9].",
    evidence: [
      { category: "focus", level: "medium" },
      { category: "power-output", level: "medium" },
    ],
    recommendedSupplementUrl: "https://geni.us/alpha-gpc",
    referencesAnchor: "#alpha-gpc-references",
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    sourceOrder: 4,
    description:
      "Ashwagandha, also known as Indian ginseng, is an herb used in Ayurveda, known for reducing stress and anxiety, reducing cortisol levels, and potentially improving sleep and physical performance[1][4][13][11][12].",
    evidence: [
      { category: "mood", level: "medium" },
      { category: "muscle", level: "low" },
      { category: "relaxation", level: "medium" },
      { category: "sleep", level: "medium" },
    ],
    recommendedSupplementUrl: "https://geni.us/ashwag",
    referencesAnchor: "#ashwagandha-references",
  },
  {
    id: "melatonin",
    name: "Melatonin",
    sourceOrder: 5,
    description:
      "Melatonin is a neurohormone that regulates the sleep/wake cycle. It is primarily used as a supplement to normalize abnormal sleep patterns. It may also help with symptoms of jet lag, shift work, irritable bowel syndrome (IBS), and tinnitus. It has been shown to lower blood sugar levels in people with type 2 diabetes and may result in small amounts of weight loss. There is ongoing research into its use as an adjunct treatment in cancer.",
    evidence: [
      { category: "longevity", level: "low" },
      { category: "muscle", level: "low" },
      { category: "sleep", level: "high" },
    ],
    recommendedSupplementUrl: "https://geni.us/melatonin-sleep",
    referencesAnchor: "#melatonin-references",
  },
  {
    id: "l-theanine",
    name: "L-Theanine",
    sourceOrder: 6,
    description:
      "L-theanine is a naturally occurring amino acid found in tea that promotes relaxation, reduces stress and anxiety levels, and may help improve sleep quality and cognitive function, especially when taken with caffeine.",
    evidence: [
      { category: "focus", level: "medium" },
      { category: "relaxation", level: "medium" },
      { category: "sleep", level: "medium" },
    ],
    recommendedSupplementUrl: "https://geni.us/LTheanine",
    referencesAnchor: "#l-theanine-references",
  },
  {
    id: "fish-oil",
    name: "Fish Oil",
    sourceOrder: 7,
    description:
      "Fish oil, a source of omega-3 fatty acids, is known to reduce triglycerides and blood pressure in hypertensives. It also shows potential in improving mood in people with major depression and reducing the symptoms of systemic lupus erythematosus[1].",
    evidence: [
      { category: "brain-function", level: "medium" },
      { category: "joints", level: "medium" },
      { category: "mood", level: "medium" },
      { category: "muscle", level: "low" },
    ],
    recommendedSupplementUrl: "https://geni.us/Fish-oil",
    referencesAnchor: "#fish-oil-references",
  },
  {
    id: "spirulina",
    name: "Spirulina",
    sourceOrder: 8,
    description:
      "Spirulina is a non-toxic blue-green algae that is rich in nutrients and phytochemicals. It offerspotentialcardiovascular, liver health, and anti-aging benefits. Spirulina may also reduce blood pressure, aidin weight loss,and provide immunomodulating properties to alleviate allergies and asthma. Its active component,phycocyanobilin,contributes to antioxidative effects, but more research is needed to fully understand its potential.",
    evidence: [
      { category: "blood-pressure", level: "low" },
      { category: "cholesterol", level: "medium" },
      { category: "fatty-liver", level: "low" },
      { category: "glucose-control", level: "low" },
      { category: "longevity", level: "low" },
      { category: "muscle", level: "low" },
    ],
    recommendedSupplementUrl: "https://geni.us/Spirulina",
  },
  {
    id: "ceylon-cinnamon",
    name: "Ceylon Cinnamon",
    sourceOrder: 9,
    description:
      "Ceylon Cinnamon, a popular spice worldwide, exerts numerous biological effects on the body. It is frequently used as an anti-diabetic compound as it reduces the rate at which glucose enters the body, improves glucose use in the cell itself, and can reduce fasting blood glucose and potentially cholesterol levels over time. However, it contains a liver toxin called coumarin, which can be harmful in high doses. Ceylon Cinnamon, derived from a different plant species, has lower levels of coumarin, making it a safer supplement option.",
    evidence: [
      { category: "cholesterol", level: "medium" },
      { category: "insulin-sensitivity", level: "medium" },
    ],
    recommendedSupplementUrl: "https://geni.us/ceylon-cinnamon",
  },
  {
    id: "curcumin",
    name: "Curcumin",
    sourceOrder: 10,
    description:
      "Curcumin, the primary bioactive substance in turmeric, has anti-inflammatory properties and can increase the body’s production of antioxidants. It has shown potential in alleviating various conditions, from chronic pain to depression. However, curcumin has poor bioavailability on its own and is often combined with Black Pepper or lipids[1][2][3][4][5][6][7].",
    evidence: [
      { category: "brain-function", level: "low" },
      { category: "insulin-sensitivity", level: "medium" },
      { category: "joints", level: "medium" },
    ],
    referencesAnchor: "#curcumin-references",
  },
  {
    id: "collagen",
    name: "Collagen",
    sourceOrder: 11,
    description:
      "Collagen, the most abundant protein in the body, plays a crucial role in the structures of the skin, cartilage, bones, and connective tissues. It is often taken as a supplement to promote skin, bone, and joint health.",
    evidence: [
      { category: "joints", level: "medium" },
      { category: "skin", level: "high" },
    ],
  },
  {
    id: "garlic",
    name: "Garlic",
    sourceOrder: 12,
    description:
      "Garlic (Allium sativum) is a vegetable that can be eaten raw or cooked. It is also sold as a dietary supplement. Garlic contains several sulfur-containing phytochemicals that are metabolized when eaten and can affect cardiovascular health and inflammation[1].",
    evidence: [
      { category: "blood-pressure", level: "low" },
      { category: "cardiovascular-health", level: "medium" },
      { category: "immune", level: "medium" },
      { category: "longevity", level: "low" },
    ],
    recommendedSupplementUrl: "https://geni.us/Garlic",
    referencesAnchor: "#garlic-references",
  },
  {
    id: "mulberry-leaf-extract",
    name: "Mulberry Leaf Extract",
    sourceOrder: 13,
    description:
      "Mulberry Leaf Extract, derived from the White Mulberry plant, has been traditionally used for vitality and immune support. Recent studies suggest its potential in regulating blood sugar levels, enhancing cognitive function, and improving cardiovascular health. However, more human trials are needed to confirm these benefits.",
    evidence: [{ category: "glucose-control", level: "medium" }],
    recommendedSupplementUrl: "https://geni.us/mulberry",
  },
  {
    id: "vitamin-d",
    name: "Vitamin D",
    sourceOrder: 14,
    description:
      "Vitamin D is a fat-soluble nutrient critical for human survival. It is primarily obtained from the sun, but can also be found in oily fish and eggs, and is added to milk and milk alternatives. Supplemental vitamin D is associated with a range of benefits, including improved immune health, bone health, and well-being. Supplementation may also reduce the risk of cancer mortality, diabetes, and multiple sclerosis.",
    evidence: [
      { category: "bone", level: "high" },
      { category: "immune", level: "high" },
      { category: "insulin-sensitivity", level: "medium" },
      { category: "mood", level: "medium" },
    ],
    recommendedSupplementUrl: "https://geni.us/vitamin-d",
    referencesAnchor: "#vitamin-d-references",
  },
  {
    id: "magnesium",
    name: "Magnesium",
    sourceOrder: 15,
    description:
      "Magnesium is an essential dietary nutrient that is involved in energy production, nervous system function, blood pressure regulation, and blood glucose control. It has been shown to reduce blood glucose, improve insulin sensitivity, lower blood pressure, and improve sleep patterns. However, high doses and certain magnesium salts can have a laxative effect[23][1].",
    evidence: [
      { category: "blood-pressure", level: "medium" },
      { category: "insulin-sensitivity", level: "medium" },
      { category: "test", level: "low" },
    ],
    recommendedSupplementUrl: "https://geni.us/magnesium-pure",
    referencesAnchor: "#magnesium-references",
  },
  {
    id: "zinc",
    name: "Zinc",
    sourceOrder: 16,
    description:
      "Zinc is an essential mineral that plays a critical role in the function of hundreds of enzymes, influencing numerous biological processes. It is most commonly taken to reduce the duration of respiratory infections and the common cold. Zinc also has potential benefits in preventing pneumonia in children, improving depressive symptoms, enhancing markers of glycemic control and blood lipids, and potentially improving severe acne[1][2][3][4][5][6][7][8][9][10][11][12][13][14].",
    evidence: [
      { category: "brain-function", level: "medium" },
      { category: "immune", level: "high" },
      { category: "test", level: "medium" },
    ],
    recommendedSupplementUrl: "https://geni.us/zinc-pure",
    referencesAnchor: "#zinc-references",
  },
  {
    id: "probiotic",
    name: "Probiotic",
    sourceOrder: 17,
    description:
      "Probiotics are a type of biotic supplement designed to influence the bacteria that reside within the colon, deriving benefits to the body secondary to the actions of these bacteria. They are ingested bacteria that alter the overall bacteria population of the colon.",
    evidence: [{ category: "gut-health", level: "high" }],
  },
  {
    id: "glucosamine",
    name: "Glucosamine",
    sourceOrder: 18,
    description:
      "Glucosamine is a supplement derived from shellfish. It is primarily sold as a joint health supplement. Studies show that supplementing glucosamine sulfate can reduce the rate of collagen (joint tissue) degradation and symptoms of osteoarthritis. Though glucosamine is comparable to acetaminophen, the reference drug for osteoarthritis, in potency, it is not as reliable. Glucosamine supplementation cannot cure osteoarthritis, but it can slow the progression of the disease.",
    evidence: [{ category: "joints", level: "medium" }],
    recommendedSupplementUrl: "https://geni.us/glucosamine",
  },
] as const satisfies readonly SupplementRecord[];
