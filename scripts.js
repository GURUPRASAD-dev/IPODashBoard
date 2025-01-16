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
        all: 'https://tradingadvisor20250101235804.azurewebsites.net/api/Trading/get-all-board',
        mainboard: 'https://tradingadvisor20250101235804.azurewebsites.net/api/Trading/get-main-board',
        sme: 'https://tradingadvisor20250101235804.azurewebsites.net/api/Trading/get-sme-board',
        current: 'https://tradingadvisor20250101235804.azurewebsites.net/api/Trading/get-main-board',
        closed: 'https://tradingadvisor20250101235804.azurewebsites.net/api/Trading/get-main-board',
        listed: 'https://tradingadvisor20250101235804.azurewebsites.net/api/Trading/get-main-board',
        allotment: 'https://tradingadvisor20250101235804.azurewebsites.net/api/Trading/get-allotment-board',
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
                    <td>${ipo['Name']}</td>
                    <td>${ipo['Status']}</td>
                    <td>${ipo['Is_SME'] == true ? 'SME' : 'MainBoard'}</td>
                    <td>${ipo['Additional_text'] !== null ? ipo['Additional_text'] : 'N/A'}</td>
                    <td>${ipo['Min_price'] !== null ? ipo['Min_price'] : 'N/A'}</td>
                    <td>${ipo['Max_price'] !== null ? ipo['Max_price'] : 'N/A'}</td>
                    <td>${ipo['Bidding_start_date'] !== null ? ipo['Bidding_start_date'] : 'N/A'}</td>
                    <td>${ipo['Bidding_end_date'] !== null ? ipo['Bidding_end_date'] : 'N/A'}</td>
                    <td>${ipo['Listing_date'] !== null ? ipo['Listing_date'] : 'N/A'}</td>
                    <td>${ipo['Lot_size'] !== null ? ipo['Lot_size'] : 'N/A'}</td>
                    <td>${ipo['GMP'] !== null ? ipo['GMP'] : 'N/A'}</td>
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



