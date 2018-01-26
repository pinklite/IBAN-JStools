

# IBAN-JStools

Validate, format, convert BBAN (Basic Bank Account Number) and IBAN (International Bank Account Number) and get bank information on countries with this javascript libary

This library follows the [ISO 13616 IBAN Registry technical specification](https://www.swift.com/standards/data-standards/iban).

## Usage

Compatible with both commonjs and AMD module definition.
It can be used as a [node.js module](#in-nodejs) and [in the browser](#in-the-browser) !

### In node.js

```js
var IBAN = require('iban');
IBAN.isValid('hi everyone'); // false
IBAN.isValid('NL86INGB0002445588'); // true
IBAN.isValidBBAN('539007547034', 'BE') // true
IBAN.isValidBBAN('123456789123456', 'BE') // false
```

### In the browser

Using a module loader (AMD or commonjs) or directly through the global ```IBAN``` object:

```html
<script src="iban.js"></script>
<script>
    // the API is now accessible from the window.IBAN global object
    IBAN.isValid('hi everyone'); // false
    IBAN.isValid('NL86INGB0002445588'); // true
    IBAN.isValidBBAN('539007547034', 'BE') // true
    IBAN.isValidBBAN('123456789123456', 'BE') // false
</script>
```

## API

    * getCountryCode (IBAN)
    * isValid (IBAN)
    * isValidBBAN (BBAN, countryCode)
    * convertToBBAN (IBAN, separator)
    * convertToIBAN (BBAN, countryCode)
    * displayFormat (IBAN, separator)
    * storageFormat (IBAN)
    * isSepaMember (IBAN or countryCode)
    * getAllCountryInfo ()
    * getCountryInfo (IBAN or countryCode)

