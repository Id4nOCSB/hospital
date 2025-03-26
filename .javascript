function showHospitalDetails(hospitalId) {
    const hospital = hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) return;

    modal.style.display = "block";
    const modalContent = document.querySelector('.modal-content');
    modalContent.querySelector('h2').textContent = hospital.name;
    modalContent.querySelector('.modal-address').textContent = `Address: ${hospital.address}`;
    modalContent.querySelector('.modal-contact-info').textContent = `Contact: ${hospital.contact}`;

    // Clear previous equipment list
    const equipmentList = modalContent.querySelector('.modal-equipment-list');
    equipmentList.innerHTML = '';
    hospital.equipment.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name}: ${item.quantity}`;
        equipmentList.appendChild(li);
    });

    // Clear previous procedures list and populate it
    const procedureList = modalContent.querySelector('.modal-procedure-list');
    procedureList.innerHTML = '';
    if (hospital.procedures && hospital.procedures.length > 0) { // Check if hospital has procedures
        hospital.procedures.forEach(procedure => {
            const li = document.createElement('li');
            li.textContent = procedure;
            procedureList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "No procedures listed.";
        procedureList.appendChild(li);
    }

    //update map
    const modalMapContainer =  modalContent.querySelector('.modal-map-container');
    if (modalMapContainer._leaflet_map) {
        modalMapContainer._leaflet_map.remove();
    }
    const modalMap = L.map(modalMapContainer).setView([hospital.latitude, hospital.longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(modalMap);
    L.marker([hospital.latitude, hospital.longitude]).addTo(modalMap).bindPopup(hospital.name);


    if (activeMarker) {
        activeMarker.closePopup();
    }
}