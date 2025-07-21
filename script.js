// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_WEB_APP_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL'; 

// Function to get public IP address [11]
async function getPublicIp() {
    try {
        const response = await fetch('https://api.ipify.org/?format=json'); // [11]
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return 'N/A'; // Return N/A if IP cannot be fetched
    }
}

// Function to handle form submission
async function handleSubmit(event, formType) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const messageElement = form.querySelector('.message');
    messageElement.textContent = 'Submitting...';
    messageElement.className = 'message'; // Reset class

    const ipAddress = await getPublicIp(); // Get IP address [11]

    const formData = new FormData(form);
    const data = {
        formType: formType,
        ipAddress: ipAddress
    };

    // Collect form specific data
    if (formType === 'parent' |

| formType === 'finder') {
        data.studentName = formData.get('studentName');
        data.studentClass = formData.get('studentClass');
        data.contactPhone = formData.get('contactPhone');
    } else if (formType === 'donor') {
        data.donorName = formData.get('donorName');
        data.bloodGroup = formData.get('bloodGroup');
        data.donorPhone = formData.get('donorPhone');
    }

    try {
        const response = await fetch(APPS_SCRIPT_WEB_APP_URL, { // [12]
            method: 'POST',
            mode: 'cors', // Required for cross-origin requests
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // Send data as JSON [12]
        });

        const result = await response.json(); // [12]

        if (result.status === 'success') {
            messageElement.textContent = result.message;
            messageElement.classList.add('success');
            form.reset(); // Clear the form on success
            loadData(); // Reload data to update tables
        } else {
            messageElement.textContent = result.message;
            messageElement.classList.add('error');
        }
    } catch (error) {
        console.error('Submission error:', error);
        messageElement.textContent = 'An error occurred during submission. Please try again.';
        messageElement.classList.add('error');
    }
}

// Function to load and display data from Google Apps Script
async function loadData() {
    const parentsFoundersTableContainer = document.getElementById('parentsFoundersTableContainer');
    const bloodDonorsTableContainer = document.getElementById('bloodDonorsTableContainer');

    parentsFoundersTableContainer.innerHTML = '<p>Loading data...</p>';
    bloodDonorsTableContainer.innerHTML = '<p>Loading data...</p>';

    try {
        const response = await fetch(APPS_SCRIPT_WEB_APP_URL, { // [12]
            method: 'GET',
            mode: 'cors'
        });
        const data = await response.json(); // [12, 9]

        // Display Parents/Founders Data
        if (data.parentsFounders && data.parentsFounders.length > 0) {
            let tableHTML = '<table><thead><tr><th>Student Name</th><th>Class</th><th>Parents Phone</th></tr></thead><tbody>';
            data.parentsFounders.forEach(row => {
                tableHTML += `<tr><td>${row.studentName}</td><td>${row.studentClass}</td><td>${row.parentsPhone}</td></tr>`;
            });
            tableHTML += '</tbody></table>';
            parentsFoundersTableContainer.innerHTML = tableHTML; // [13, 14]
        } else {
            parentsFoundersTableContainer.innerHTML = '<p>No missing/found children reported yet.</p>';
        }

        // Display Blood Donors Data
        if (data.bloodDonors && data.bloodDonors.length > 0) {
            let tableHTML = '<table><thead><tr><th>Name</th><th>Group</th><th>Contact Phone</th></tr></thead><tbody>';
            data.bloodDonors.forEach(row => {
                tableHTML += `<tr><td>${row.name}</td><td>${row.group}</td><td>${row.contactPhone}</td></tr>`;
            });
            tableHTML += '</tbody></table>';
            bloodDonorsTableContainer.innerHTML = tableHTML; // [13, 14]
        } else {
            bloodDonorsTableContainer.innerHTML = '<p>No blood donors registered yet.</p>';
        }

    } catch (error) {
        console.error('Error loading data:', error);
        parentsFoundersTableContainer.innerHTML = '<p class="message error">Error loading data. Please try refreshing the page.</p>';
        bloodDonorsTableContainer.innerHTML = '<p class="message error">Error loading data. Please try refreshing the page.</p>';
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('parentForm').addEventListener('submit', (e) => handleSubmit(e, 'parent'));
    document.getElementById('finderForm').addEventListener('submit', (e) => handleSubmit(e, 'finder'));
    document.getElementById('donorForm').addEventListener('submit', (e) => handleSubmit(e, 'donor'));

    loadData(); // Load data when the page loads
});
