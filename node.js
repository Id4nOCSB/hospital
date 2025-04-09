const fs = require('fs');

// Load the JSON file
const filePath = './hospital_data.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Function to flatten and clean the JSON
function cleanHospitalData(hospitals) {
    const cleanedData = [];

    function processEntry(entry) {
        if (Array.isArray(entry)) {
            entry.forEach(processEntry);
        } else if (entry && typeof entry === 'object') {
            // Remove invalid fields
            if (entry.equipment) {
                entry.equipment = entry.equipment.map(item => ({ name: item.name }));
            }
            cleanedData.push(entry);
        }
    }

    processEntry(hospitals);
    return cleanedData;
}

// Clean the data
const cleanedData = cleanHospitalData(data);

// Save the cleaned JSON back to the file
fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf8');
console.log('Hospital data has been cleaned and flattened.');