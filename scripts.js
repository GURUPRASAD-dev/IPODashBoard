document.addEventListener('DOMContentLoaded', () => {
    // Get the section attribute from the body tag
    const section = document.body.getAttribute('data-section');
    // Check if section is present, then fetch the data
    if (section) {
        fetchIPOs(section);
    } else {
        console.error('No section specified on the body tag.');
    }
});

// Function to fetch IPO data from the API
async function fetchIPOs(section) {
    // Define the API URLs for different sections
    const apiUrls = {
        all: 'http://192.168.1.8:8091/api/Trading/get-all-board',
        mainboard: 'http://192.168.1.8:8091/api/Trading/get-main-board',
        sme: 'http://192.168.1.8:8091/api/Trading/get-sme-board',
        current: 'http://192.168.1.8:8091/api/Trading/get-main-board',
        closed: 'http://192.168.1.8:8091/api/Trading/get-main-board',
        listed: 'http://192.168.1.8:8091/api/Trading/get-main-board',
        allotment: 'http://192.168.1.8:8091/api/Trading/get-allotment-board',
    };

    // Log the section being used
    console.log('Fetching data for section:', section);

    // Check if the section is valid
    if (!apiUrls[section]) {
        console.error('Invalid section provided:', section);
        return;
    }

    try {
        // Fetch data from the API
        const response = await fetch(apiUrls[section]);

        // Handle the case where the response is not ok (status code 4xx or 5xx)
        if (!response.ok) {
            throw new Error(`Error fetching data for ${section}: ${response.statusText}`);
        }

        // Parse the JSON data from the response
        const data = await response.json();

        // Update the table with the fetched data
        updateTable(section, data);
    } catch (error) {
        console.error(`Error fetching data for ${section}:`, error);
    }
}



// Function to update the table with fetched data
function updateTable(section, data) {
    const tableBody = document.querySelector('.table tbody');

    // Clear existing table rows to prevent duplicates
    tableBody.innerHTML = '';

    // Check if data is not empty
    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">No data available for this section.</td></tr>';
        return;
    }

    // Use a Set to track already added rows and prevent duplicates
    const addedRows = new Set();

    // Iterate over the data and create table rows
    data.forEach((ipo) => {
        // Create a unique identifier for each row to prevent duplicates
        const uniqueId = `${ipo.Company || ipo.name || ipo.CompanyName}-${ipo.Dates || ipo.listingDate}`;

        // Check if the row already exists in the Set
        if (addedRows.has(uniqueId)) {
            return; // Skip adding this duplicate row
        }

        // Add the unique ID to the Set
        addedRows.add(uniqueId);

        let rowContent = '';
        switch (section) {
            case 'all':
            case 'mainboard':
            case 'sme':
                rowContent = `
                    <td>${ipo['Company']}</td>
                    <td>${ipo['Issue Price']}</td>
                    <td>${ipo['Listing Price']}</td>
                    <td>${ipo['Gain or Loss'] !== null ? ipo['Gain or Loss'] : 'N/A'}</td>
                    <td>${ipo['Dates']}</td>
                    <td>${ipo['Minimum Investment']}</td>
                    <td>${ipo['Category']}</td>
                `;
                break;

            case 'current':
                rowContent = `
                    <td>${ipo.name}</td>
                    <td>${ipo.subscription}</td>
                    <td>${ipo.issueSize}</td>
                    <td>${ipo.openingDate}</td>
                    <td>${ipo.closingDate}</td>
                `;
                break;

            case 'closed':
                rowContent = `
                    <td>${ipo.name}</td>
                    <td>${ipo.issuePrice}</td>
                    <td>${ipo.listingDate}</td>
                    <td>${ipo.finalSubscription}</td>
                    <td>${ipo.status}</td>
                `;
                break;

            case 'listed':
                rowContent = `
                    <td>${ipo.name}</td>
                    <td>${ipo.issuePrice}</td>
                    <td>${ipo.listingPrice}</td>
                    <td>${ipo.gainOrLoss}</td>
                    <td>${ipo.listingDate}</td>
                `;
                break;

            case 'allotment':
                rowContent = `
                    <td>${ipo.CompanyName}</td>
                    <td>${ipo.IPOStatus}</td>
                    <td>${ipo.IPOAllotment}</td>
                    <td>${ipo.RegistrarLink}</td>
                    <td>${ipo.Listing}</td>
                `;
                break;
        }

        // Create a new row element and append it to the table body
        const row = document.createElement('tr');
        row.innerHTML = rowContent;
        tableBody.appendChild(row);
    });
}



