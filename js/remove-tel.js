// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Check if the table exists
    var calTable = document.getElementById('cal-table');

    // If the table exists, proceed to add 'data="notel"' to each cell
    if (calTable) {
        var cellIds = ['caltab-r', 'protab-r', 'fattab-r', 'cartab-r'];

        cellIds.forEach(function (id) {
            var cell = document.getElementById(id);
            if (cell) {
                cell.setAttribute('data', 'notel');
            }
        });
    } else {
        // If the table does not exist, log an error or handle as needed
        console.error("Table with ID 'cal-table' was not found in the DOM.");
    }
});