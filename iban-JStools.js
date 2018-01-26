(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // A.M.D.
      define(['exports'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
      // CommonJS
      factory(exports);
  } else {
      // Browser globals
      factory(root.IBAN = {});
  }
}(this, function(exports){

  var countries = require('./countries-min.json'),
    countriesListCode = Object.keys(countries);

//.includes Polyfill
// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/includes
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this),
         len = o.length >>> 0;
      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0,
         k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) {
        if (o[k] === searchElement) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

// .map Polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
// Code from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function(callback/*, thisArg*/) {
      var T, A, k;
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }
      var O = Object(this);
      var len = O.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }
      if (arguments.length > 1) {
        T = arguments[1];
      }
      k = 0;
      while (k < len) {
        var kValue, mappedValue;
        if (k in O) {
          kValue = O[k];
          mappedValue = callback.call(T, kValue, k, O);
          A[k] = mappedValue;
        }
        k++;
      }
      return A;
    };
  }

  //Global vars
  var A = 'A'.charCodeAt(0),
    Z = 'Z'.charCodeAt(0),
    NON_ALPHANUMUERIC = /[^a-zA-Z0-9]/g,
    BLOCK_FOUR = /(.{4})(?!$)/g;

  /**
   * [ISO13616] Prepare an IBAN for mod 97 10 computation
   */
    function ibanPrepare(value) {
      var iban = value.toUpperCase(),
        code,
        toReturn;
      iban = iban.substr(4) + iban.substr(0,4);
      iban = iban.split('');
      return iban.map(function(i) {
          code = i.charCodeAt(0);
          code >= A && code <= Z ? toReturn = code - A + 10 : toReturn = i;
          return toReturn;
      }).join('');
  }

  /**
   * [ISO7064] Calculates the MOD 97 10 of the IBAN
  */
  function mod9710(param) {
    var dataBlock,
      iban = param;
    while (iban.length > 2){
      dataBlock = iban.slice(0, 9);
      iban = parseInt(dataBlock, 10) % 97 + iban.slice(dataBlock.length);
    }
    return parseInt(iban, 10) % 97;
  }

  function buildRegex (code) {
    var format, pattern, repeats,
        regex = code.match(/(.{3})/g).map(function (block) {

          pattern = block.slice(0, 1),
          repeats = parseInt(block.slice(1), 10);

        switch (pattern){
            case "A": format = "0-9A-Za-z"; break;
            case "B": format = "0-9A-Z"; break;
            case "C": format = "A-Za-z"; break;
            case "D": format = "0-9"; break;
            case "E": format = "A-Z"; break;
        }

        return '([' + format + ']{' + repeats + '})';
    });
    return new RegExp('^' + regex.join('') + '$');
  }

  /**
   * Return the country code if it's include into the countries-min.json
   */
  exports.getCountryCode = function (iban) {
    if (typeof iban === 'undefined') {
      throw new Error('No IBAN provided');
    }
    if (typeof iban === 'string' && iban.length > 1) {
      var countryCode = this.storageFormat(iban).substr(0, 2);
      return countriesListCode.includes(countryCode) ? countryCode : false;
    }
  }

  exports.isValid = function (data) {
    if (typeof data === 'undefined') {
      throw new Error('No IBAN provided');
    }
    var iban = this.storageFormat(data),
      countryInfo = this.getCountryInfo(iban),
      regex = buildRegex(countryInfo.bbanRegex);

    return countryInfo.ibanLength == iban.length
      && regex.test(iban.slice(4))
      && mod9710(ibanPrepare(iban)) == 1;
  }

  exports.isValidBBAN = function (data, countryCode) {
    if (typeof data === 'undefined') {
      throw new Error('No BBAN provided');
    }
    if (typeof countryCode === 'undefined') {
      throw new Error('No country code provided');
    }
    countryCode = countryCode.toUpperCase();
    var bban = this.storageFormat(data),
      countryInfo = this.getCountryInfo(countryCode),
      regex = buildRegex(countryInfo.bbanRegex);

    return countryInfo.bbanLength === bban.length
      && regex.test(bban);
  }

  exports.convertToBBAN = function (data, separator) {
    if (typeof data === 'undefined') {
      throw new Error('No IBAN provided');
    }
    var iban = this.storageFormat(data),
      countryInfo = this.getCountryInfo(iban),
      regex = buildRegex(countryInfo.bbanRegex);

    if (typeof separator === 'undefined') {
      separator = ' ';
    }
    return regex.exec(iban.slice(4)).slice(1).join(separator);
  }

  exports.convertToIBAN = function (bban, countryCode) {
    if (typeof bban === 'undefined') {
      throw new Error('No BBAN provided');
    }

    bban = this.storageFormat(bban);

    if (typeof countryCode === 'undefined') {
      throw new Error('No Country code provided');
    }

    countryCode = countryCode.toUpperCase();

    if (!countriesListCode.includes(countryCode)){
      throw new Error('Country code is not correct or not supported');
    }

    if (!this.isValidBBAN(bban, countryCode)){
      throw new Error('Invalid BBAN');
  }

    var restant = mod9710(ibanPrepare(countryCode + '00' + bban)),
        checkDigit = ('0' + (98 - restant)).slice(-2);

  return countryCode + checkDigit + bban;
  }

  exports.storageFormat = function (data) {
    if (typeof data === 'undefined') {
      throw new Error('No IBAN or BBAN provided');
    }
    return data.replace(NON_ALPHANUMUERIC, '').toUpperCase();
  }

  exports.displayFormat = function (data, separator) {
    if (typeof data === 'undefined') {
      throw new Error('No IBAN or BBAN provided');
    }
    if (typeof separator == 'undefined'){
      separator = ' ';
    }
    return this.storageFormat(data).replace(BLOCK_FOUR, "$1" + separator);
  }

  exports.isSepaMember = function (data) {
    if (typeof data === 'undefined') {
      throw new Error('No IBAN or Country Code provided');
    }
      var countryCode = data.length === 2 ? data : this.getCountryCode(data);
      if (countryCode) {
        var country = countries[countryCode];
        if (country) {
          return country.sepaCountry;
        } else {
          throw new Error('No country info for country code : ' + countryCode);
        }
      }
  }

  exports.getAllCountryInfo = function () {
    return countries;
  }

  exports.getCountryInfo = function (data) {
    if (typeof data === 'undefined') {
      throw new Error('No IBAN or Country Code provided');
    }
      var countryCode = data.length === 2 ? data : this.getCountryCode(data);
      if (countryCode) {
        var country = countries[countryCode];
        if (country) {
          return country;
        } else {
          throw new Error('No country info for country code : ' + countryCode);
        }
      }
  }
}));