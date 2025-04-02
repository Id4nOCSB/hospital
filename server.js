const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to fetch hospital information
app.post('/api/hospital-info', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const hospitalName = $('h1').first().text().trim();
        const contactInfo = $('.contact-info').text().trim();
        const services = $('.services-list li').map((i, el) => $(el).text().trim()).get();

        res.json({
            name: hospitalName || 'Name not found',
            contact: contactInfo || 'Contact info not found',
            services: services.length > 0 ? services : ['Services not found']
        });
    } catch (error) {
        console.error('Error fetching hospital information:', error.message);
        res.status(500).send('Error fetching hospital information');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Server is running on http://localhost:3000');
});

async function fetchHospitalInfo(url) {
    try {
        const response = await fetch('http://localhost:3000/api/hospital-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: "https://example-hospital.com" })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return `Hospital Name: ${data.name}\nContact: ${data.contact}\nServices: ${data.services.join(', ')}`;
    } catch (error) {
        console.error('Error fetching hospital information:', error);
        return 'Sorry, I am having trouble fetching information from the hospital website.';
    }
}

// Handle user input
chatbotInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && chatbotInput.value.trim() !== '') {
        const userMessage = chatbotInput.value.trim();
        chatbotMessages.innerHTML += `<div class="message user-message">${userMessage}</div>`;
        chatbotInput.value = '';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        let botResponse;

        // Check if the user is asking for hospital information
        if (userMessage.toLowerCase().includes('info about')) {
            const hospital = hospitals.find(h => userMessage.toLowerCase().includes(h.name.toLowerCase()));
            if (hospital && hospital.Website) {
                botResponse = await fetchHospitalInfo(hospital.Website);
            } else {
                botResponse = 'Sorry, I could not find the hospital you are asking about. Please try again.';
            }
        } else {
            botResponse = 'Sorry, I can only fetch information about hospitals. Please ask about a specific hospital.';
        }

        chatbotMessages.innerHTML += `<div class="message bot-message">${botResponse}</div>`;
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});