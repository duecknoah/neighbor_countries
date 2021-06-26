const world = {
  map: {},
  countryToCodeMap: {},
  isReady: false,
  /**
   * Fetches all country info to be cached. Then stores it in a hashmap
   * where each of the countries name is the key and the value is the object.
   * All keys are converted to lowercase
   */
  fetchInfo: async function() {
    // https://restcountries.eu/rest/v2/all
    const resp = await fetch(`https://restcountries.eu/rest/v2/all`);
    const data = await resp.json();
    data.forEach(countryObj => {
      this.countryToCodeMap[countryObj.name.toLowerCase()] = countryObj.alpha3Code; // ex. [Canada] -> 'CAN'
      this.map[countryObj.alpha3Code] = {
        name: countryObj.name,
        capital: countryObj.capital,
        borders: countryObj.borders,
        population: countryObj.population,
        languages: countryObj.languages.map(langObj => langObj.name),
        currencies: countryObj.currencies.map(curObj => curObj.code),
        flag: countryObj.flag,
        exists: true
      } // countryObj; // ex [CAN] -> { name: 'Canada', ...}
    });
    this.isReady = true;
    Promise.resolve();
  },

  /**
   * @param {String} countryName The name of the desired country
   * @returns The alpha3 code representation of that country
   */
  getCode: function(countryName) {
    return this.countryToCodeMap[countryName.toLowerCase()];
  },

  /**
   * @param {String} country the code desired country
   * @returns an object of the country, the key 'exists' is false if invalid country
   */
  getCountry: function(code) {
    if (code in this.map)
      return this.map[code];
    else
      return {
        'exists': false
      }
  },

  /**
   * @param {String} country the desired country (code) to find neighbors of
   * @returns an array containing all of the neighboring country objects
   */
  getNeighboringCountries: function(code) {
    let countryObj = this.getCountry(code);
    let neighborsArr = [];

    if (countryObj.exists) {
      neighborsArr = countryObj.borders.map(border => this.getCountry(border));
    }

    return neighborsArr;
  },

  getCapitalsAndNeighboring: function(code) {
    // Store main country and neighboring countries in an array
    let countries = [];
    let mainCountry = this.getCountry(code);

    if (mainCountry.exists) {
      countries.push(mainCountry);
      this.getNeighboringCountries(code).forEach(countryObj => countries.push(countryObj));
    }

    return countries;
  },
};

function loadWorldData() {
  return world.fetchInfo();
}

function getRestCountries() {
  let countryName = document.getElementById('country_input').value;
  let capitalsData = world.getCapitalsAndNeighboring(world.getCode(countryName));
  let countries_list = document.getElementById('countries_list');

  // Clear capitals list
  while (countries_list.firstChild)
    countries_list.removeChild(countries_list.lastChild);

  // If no capitals, simply put a textbox of Invalid Country
  if (capitalsData.length === 0) {
    let invalidCountry = document.createElement('div');
    invalidCountry.className = "invalidCountryText";
    invalidCountry.textContent = "Invalid Country!";
    countries_list.appendChild(invalidCountry);
    return;
  }

  // Append each capital as a list element
  capitalsData.forEach(mapping => {
    // Create elements for page
    let entry = document.createElement('div');
    let flag = document.createElement('img');
    let countryFlagContainer = document.createElement('div');
    let countryInfoContainer = document.createElement('div');
    let countryName = document.createElement('h2');
    let countryInfo = document.createElement('p');
    let clearFix = document.createElement('div');
    clearFix.className = 'clearfix';
    countryName.className = 'h2';

    // Set styles and add appropriate children.
    // For each Country pass its data into our text content
    flag.src = mapping.flag;
    flag.className = "countryFlag";
    countryFlagContainer.className = 'countryFlagContainer';
    countryFlagContainer.appendChild(flag);
    countryInfo.className = "countryInfo";
    countryInfo.textContent =
      `Capital: ${mapping.capital.length !== 0 ? mapping.capital : "No capital"}\r\n
      Population: ${mapping.population}\r\n
      Languages: ${mapping.languages}\r\n
      Currencies: ${mapping.currencies}\r\n
      `
    countryName.textContent = mapping.name;

    // Append children and add entry to our countries list
    // to be displayed
    countryInfoContainer.appendChild(countryName);
    countryInfoContainer.appendChild(countryInfo);
    countryInfoContainer.className = 'countryInfoContainer';
    entry.appendChild(countryFlagContainer);
    entry.appendChild(countryInfoContainer);
    entry.appendChild(clearFix);
    entry.className = "countryContainer";

    countries_list.appendChild(entry);
  });
}