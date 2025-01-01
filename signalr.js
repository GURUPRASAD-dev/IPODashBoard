document.addEventListener("DOMContentLoaded", () => {
    // Initialize SignalR connection
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://tradingadvisor20250101235804.azurewebsites.net/stocksHub")
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

    // Get the stocks container
    const stocksContainer = document.getElementById("stocksContainer");

    // Ensure stocksContainer exists
    if (!stocksContainer) {
        console.error("Error: stocksContainer element not found in the DOM.");
        return;
    }

    // Create and style the filter container
    const filterContainer = document.createElement("div");
    filterContainer.id = "filterContainer";
    filterContainer.style.marginBottom = "1em";

    // Dropdown for company name
    const companyFilter = document.createElement("select");
    companyFilter.id = "companyFilter";
    companyFilter.innerHTML = `<option value="">Filter by Company</option>`;
    filterContainer.appendChild(companyFilter);

    // Dropdown for percentage change
    const percentageFilter = document.createElement("select");
    percentageFilter.id = "percentageFilter";
    percentageFilter.innerHTML = `
        <option value="">Filter by % Change</option>
        <option value="positive">Positive Change</option>
        <option value="negative">Negative Change</option>
    `;
    filterContainer.appendChild(percentageFilter);

    // Dropdown for price range
    const priceFilter = document.createElement("select");
    priceFilter.id = "priceFilter";
    priceFilter.innerHTML = `
        <option value="">Filter by Price</option>
        <option value="low">₹0 - ₹1000</option>
        <option value="medium">₹1000 - ₹5000</option>
        <option value="high">₹5000+</option>
    `;
    filterContainer.appendChild(priceFilter);

    // Insert filter container as a sibling above stocks container
    stocksContainer.parentNode.insertBefore(filterContainer, stocksContainer);

    // Remaining SignalR and filtering logic remains the same
    const stockMap = new Map();

    function applyFilters() {
        const selectedCompany = companyFilter.value.toLowerCase();
        const selectedPercentage = percentageFilter.value;
        const selectedPrice = priceFilter.value;

        document.querySelectorAll(".stock-card").forEach((card) => {
            const companyName = card.querySelector("h3").textContent.toLowerCase();
            const change = parseFloat(
                card.querySelector(".highlight-change").textContent.split(" ")[0]
            );
            const price = parseFloat(
                card.querySelector(".highlight-price").textContent.replace("₹", "")
            );

            let showCard = true;

            if (selectedCompany && !companyName.includes(selectedCompany)) {
                showCard = false;
            }

            if (selectedPercentage === "positive" && change < 0) {
                showCard = false;
            } else if (selectedPercentage === "negative" && change >= 0) {
                showCard = false;
            }

            if (selectedPrice === "low" && price > 1000) {
                showCard = false;
            } else if (selectedPrice === "medium" && (price <= 1000 || price > 5000)) {
                showCard = false;
            } else if (selectedPrice === "high" && price <= 5000) {
                showCard = false;
            }

            card.style.display = showCard ? "" : "none";
        });
    }

    [companyFilter, percentageFilter, priceFilter].forEach((filter) =>
        filter.addEventListener("change", applyFilters)
    );

    connection.on("ReceiveStockDetails", (stock) => {
        const {
            companyname,
            change,
            dayHigh,
            dayLow,
            lastPrice,
            identifier,
            lastUpdateTime,
            percentageChange,
            percentageChange30Days,
            percentageChange365Days,
            open,
            previousClose,
            isBroadcasted
        } = stock;

        if (stockMap.has(companyname)) {
            const existingDiv = stockMap.get(companyname);
            existingDiv.remove();
        }

        const stockDiv = document.createElement("div");
        stockDiv.className = "stock-card";

        stockDiv.innerHTML = `
            <h3>${companyname} <span class="identifier">${identifier}</span></h3>
            <p><strong>Last Price:</strong> ₹<span class="highlight-price">${lastPrice}</span></p>
            <p><strong>Change:</strong> <span class="highlight-change" style="color: ${parseFloat(change) >= 0 ? 'green' : 'red'};">${change} (${percentageChange}%)</span></p>
            <p><strong>Day High:</strong> ₹<span class="highlight-high">${dayHigh}</span> | <strong>Day Low:</strong> ₹<span class="highlight-low">${dayLow}</span></p>
            <p><strong>Open:</strong> ₹${open} | <strong>Previous Close:</strong> ₹${previousClose}</p>
            <p><strong>30 Days %:</strong> <span class="highlight-30days">${percentageChange30Days}%</span> | <strong>365 Days %:</strong> <span class="highlight-365days">${percentageChange365Days}%</span></p>
            <p><em>Last Updated:</em> ${new Date(lastUpdateTime).toLocaleString()}</p>
            <p class="broadcasted">${isBroadcasted ? '<i class="fas fa-broadcast-tower"></i> Broadcasted' : ''}</p>
        `;

        stocksContainer.prepend(stockDiv);
        stockMap.set(companyname, stockDiv);

        const optionExists = Array.from(companyFilter.options).some(
            (option) => option.value === stock.companyname
        );

        if (!optionExists) {
            const newOption = document.createElement("option");
            newOption.value = stock.companyname;
            newOption.textContent = stock.companyname;
            companyFilter.appendChild(newOption);
        }
    });

    async function startConnection() {
        try {
            await connection.start();
            console.log("SignalR connected successfully!");
        } catch (err) {
            console.error("SignalR connection failed. Retrying in 5 seconds...", err);
            setTimeout(startConnection, 5000);
        }
    }

    connection.onreconnecting(() => {
        console.warn("SignalR reconnecting...");
    });

    connection.onreconnected(() => {
        console.log("SignalR reconnected successfully.");
    });

    connection.onclose(() => {
        console.warn("SignalR connection lost. Attempting to reconnect...");
        startConnection();
    });

    startConnection();
});
