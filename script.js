function showtime(){
    document.getElementById("time").innerHTML = new Date().toUTCString();
}
showtime();
setInterval(function(){
    showtime();
}
, 1000);

let hospitals = [];

// Fetch hospital data from hospital_data.json
fetch('hospital_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hospitals = data;
        initializeApp(); // Call your app initialization logic
    })
    .catch(error => {
        console.error('Error loading hospital data:', error);
    });

function initializeApp() {
    // Populate equipment filter
    const equipmentOptions = [...new Set(hospitals.flatMap(hospital => hospital.equipment.map(item => item.name)))];
    equipmentOptions.forEach(equipment => {
        const option = document.createElement('option');
        option.value = equipment;
        option.textContent = equipment;
        document.getElementById('equipment-filter').appendChild(option);
    });

    // Initial display
    filterHospitals();
}      

const map = L.map('map').setView([43.651070, -79.347015], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const hospitalListElement = document.getElementById('hospital-list');
const equipmentFilter = document.getElementById('equipment-filter');
const locationFilter = document.getElementById('location-filter');
const noResultsMessage = document.getElementById('no-results');
const modal = document.getElementById('hospitalModal');
const modalClose = document.querySelector('.close');

let activeMarker = null; // Keep track of the active marker

function createHospitalCard(hospital) {
    const card = document.createElement('div');
    card.className = 'hospital-card';
    card.innerHTML = `
        <h2>${hospital.name}</h2>
        <p>Address: ${hospital.address}</p>
        <p>Contact: ${hospital.contact}</p>
        <button data-hospital-id="${hospital.hospitalId}">View Details</button>
    `;
    const viewDetailsButton = card.querySelector('button');
    viewDetailsButton.addEventListener('click', () => showHospitalDetails(hospital.hospitalId));
    return card;
}

function updateHospitalList(filteredHospitals) {
    hospitalListElement.innerHTML = '';
    if (filteredHospitals.length === 0) {
        noResultsMessage.style.display = 'block';
    } else {
        noResultsMessage.style.display = 'none';
        filteredHospitals.forEach(hospital => {
            hospitalListElement.appendChild(createHospitalCard(hospital));
        });
    }
}

function updateMap(filteredHospitals) {
    // Remove existing markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add markers for filtered hospitals
    filteredHospitals.forEach(hospital => {
        const marker = L.marker([hospital.latitude, hospital.longitude])
            .addTo(map)
            .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}`);
        marker.on('click', () => showHospitalDetails(hospital.hospitalId)); // Show details on marker click
    });
}

function filterHospitals() {
    const selectedEquipment = equipmentFilter.value;
    const location = locationFilter.value.toLowerCase();

    let filteredHospitals = hospitals;

    if (selectedEquipment) {
        filteredHospitals = filteredHospitals.filter(hospital =>
            hospital.equipment.some(item => item.name === selectedEquipment)
        );
    }

    if (location) {
        filteredHospitals = filteredHospitals.filter(hospital =>
            hospital.address.toLowerCase().includes(location) || hospital.name.toLowerCase().includes(location)
        );
    }

    updateHospitalList(filteredHospitals);
    updateMap(filteredHospitals);
}

// Populate equipment filter
const equipmentOptions = [...new Set(hospitals.flatMap(hospital => hospital.equipment.map(item => item.name)))];
equipmentOptions.forEach(equipment => {
    const option = document.createElement('option');
    option.value = equipment;
    option.textContent = equipment;
    equipmentFilter.appendChild(option);
});

// Event listeners for filtering
equipmentFilter.addEventListener('change', filterHospitals);
locationFilter.addEventListener('input', filterHospitals);

// Initial display
filterHospitals();

function showHospitalDetails(hospitalId) {
    const hospital = hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) return;

    modal.style.display = "block";
    const modalContent = document.querySelector('.modal-content');
    const hospitalNameElement = modalContent.querySelector('h2');
    hospitalNameElement.textContent = hospital.name;
    hospitalNameElement.dataset.hospitalId = hospitalId; // Store the hospitalId for TTS

    modalContent.querySelector('.modal-address').textContent = `Address: ${hospital.address}`;
    modalContent.querySelector('.modal-contact-info').textContent = `Contact: ${hospital.contact}`;

    // Clear and populate equipment list
    const equipmentList = modalContent.querySelector('.modal-equipment-list');
    equipmentList.innerHTML = '';
    hospital.equipment.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name}: ${item.quantity}`;
        equipmentList.appendChild(li);
    });

    // Clear and populate procedure list
    const procedureList = modalContent.querySelector('.modal-procedure-list');
    procedureList.innerHTML = '';
    hospital.procedure.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        procedureList.appendChild(li);
    });

    // Add website link
    const websiteLink = modalContent.querySelector('.modal-website-link');
    if (hospital.Website) {
        websiteLink.innerHTML = `<a href="${hospital.Website}" target="_blank">${hospital.Website}</a>`;
    } else {
        websiteLink.textContent = "No website available.";
    }

    // Update modal map
    const modalMapContainer = modalContent.querySelector('.modal-map-container');
    if (modalMapContainer._leaflet_map) {
        modalMapContainer._leaflet_map.remove();
    }
    const modalMap = L.map(modalMapContainer).setView([hospital.latitude, hospital.longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(modalMap);
    L.marker([hospital.latitude, hospital.longitude]).addTo(modalMap).bindPopup(hospital.name);
    modalMapContainer._leaflet_map = modalMap;
}

function stopSpeech() {
    if (window.speechSynthesis.speaking) {
        const utterance = new SpeechSynthesisUtterance(""); // Empty utterance
        window.speechSynthesis.speak(utterance); // Speak the empty utterance
        window.speechSynthesis.cancel(); // Cancel the speech
    }
}

modalClose.onclick = function() {
    modal.style.display = "none";
    stopSpeech();
};

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
        stopSpeech();
    }
};

function readAloud(hospital) {
    if (!window.speechSynthesis) {
        alert("Text-to-Speech is not supported in this browser.");
        return;
    }

    // Generate the text content to read aloud
    const text = `
        Hospital Name: ${hospital.name}.
        Address: ${hospital.address}.
        Contact: ${hospital.contact}.
        Available Equipment: ${hospital.equipment.map(item => `${item.name} (${item.quantity})`).join(", ")}.
        Procedures offered: ${hospital.procedure.join(", ")}.
    `;

    // Create a new SpeechSynthesisUtterance instance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // Set the language
    utterance.rate = 1; // Set the speaking rate (1 is normal speed)

    // Speak the text
    window.speechSynthesis.speak(utterance);
}
// Add event listener for the "Read Aloud" button
document.getElementById("read-aloud-button").addEventListener("click", () => {
    const hospitalId = document.querySelector(".modal-content h2").dataset.hospitalId;
    const hospital = hospitals.find(h => h.hospitalId === hospitalId);
    if (hospital) {
        readAloud(hospital);
    }
});

// Chatbot functionality
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');

// Toggle chatbot visibility
chatbotToggle.addEventListener('click', () => {
    chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'block' : 'none';
    if (!chatbotMessages.dataset.initialized) {
        chatbotMessages.innerHTML = `<div class="message bot-message">Hello! Ask me about hospital wait times, services, or parking prices in Ontario.</div>`;
        chatbotMessages.dataset.initialized = true; // Mark as initialized
    }
});

// Handle user input
chatbotInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && chatbotInput.value.trim() !== '') {
        const userMessage = chatbotInput.value.trim();
        chatbotMessages.innerHTML += `<div class="message user-message">${userMessage}</div>`;
        chatbotInput.value = '';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Send the user query to the server
        const botResponse = await fetchChatResponse(userMessage);
        chatbotMessages.innerHTML += `<div class="message bot-message">${botResponse}</div>`;
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});

// Fetch response from the server
async function fetchChatResponse(query) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant providing information about hospitals in Ontario.' },
                    { role: 'user', content: query }
                ],
                max_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching chat response:', error);
        return 'Sorry, I am having trouble connecting to the server. Please try again later.';
    }
}

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

// Check for saved theme preference in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeIcon.src = 'https://cdn-icons-png.flaticon.com/512/1164/1164946.png'; // Moon icon
}

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');

    // Update the icon and button background dynamically
    themeIcon.src = isDarkMode
        ? 'https://cdn-icons-png.flaticon.com/512/1164/1164946.png' // Moon icon
        : 'https://cdn-icons-png.flaticon.com/512/1164/1164954.png'; // Sun icon
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});
