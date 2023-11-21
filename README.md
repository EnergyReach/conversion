# conversion
A simple library to perform units conversion.

## Usage

### Installation
Install the package:
```
npm install @energyreach/conversion
```
Then use it in code as follows:
```ts
import { Convert } from '@energyreach/conversion';
```

### Class creation
Create a conversion object to work with. If no constructor parameters are specified, the default [UnitsLibrary](./src/units.ts) will be loaded.
```ts
// object creation with default units library
const a = new Convert();

// object creation with energy units conversion only
const a = new Convert('energy');

// object creation with temperature and volume units conversion only
const a = new Convert(['temperature', 'volume']);

// object creation with custom units conversion library
const a = new Convert(customUnitsLibrary);
```
Parameters to `Convert()`:
- group name (`str`): One of the units groups to be loaded as specified in [Group](./src/types.ts) type.
- a list of group names (`str[]`): A list of the units groups to be loaded as specified in [Group](./src/types.ts) type.
- units library (`Units`): If specified, only this library will be loaded.

### Custom units
Other than using the builtin unit conversions, you can also create and import your own as follows:
```ts
// object creation with default units library
const a = new Convert();
a.load({
    // Define distance group conversions
    // NOTE: Unit names can be anything, but must be unique, otherwise an existing unit in cache will be overwritten
    'distance': {
        'm': {},
        'km': {base: 1000},
        // you can also add a display name for this unit during printing
        'mi': {base: 1609.344, display: 'mile'},
        // you can also instead of using base, add a formula
        'cm': {
            to: (value: Value): Value => value.div(1000),
            from: (value: Value): Value => value.mul(1000),
        }
    }
});

// empty the units library cache (no units will be loaded and you can start loading anew)
a.clear();
```
_NOTE: Calling `load` will not clear previous unit loads, but will instead load and overwrite any overlaps._

### Conversion
Perform simple unit conversions.
```ts
// object creation with default units library
const a = new Convert();

// returns a float number = 54.5
a.from(12.5, 'C').to('F');

// returns a float number with 2 digits after decimal point precision = 72.98
a.from(22.7643, 'C').to('F', 2);

// returns a float number = 18.29
a.from(18.29, 'C').value();
// returns a float number with custom precision = 18.3
a.from(18.29, 'C').value(1);
```

### Precision
You can set precisions in two different ways. Object based precision, which will carry throughout the life of a conversion object, or on-the-go precision, which will apply only to the function call, while the object will retain its originally set precision.
```ts
// The default precision is 3 digits after the decimal point
const a = new Convert();

// set the precision to 5 digits after the decimal point
a.precision(5);

// the object precision is now 5 digits, while both of these will return 3 decimal points
a.from(18.29, 'C').value(3);
a.from(18.29, 'C').to('F', 3);

// the following will return 5 decimal points
a.from(18.29, 'C').value();
a.from(18.29, 'C').to('F');
```

### Validation
You can also manually check if a unit is loaded and can be worked with.

```ts
// The default precision is 3 digits after the decimal point
const a = new Convert();

// check if we can work with cubic meters
// An error will be thrown if the unit is not found in cache
a.verifyUnit('m^3')
```

_NOTE: All unit operations auto-check whether a particular unit exists before performing any operations._

### Display
You can also call the display name of each unit. The following will return cubic meters as '&#13221;'

```ts
// The default precision is 3 digits after the decimal point
const a = new Convert();

// returns the display name for cubic meters
a.display('m^3')
```

### Global
There is a limited set of static functions which can be used for convenience.

```ts
// Clear the static cache
Convert.clear();

// Load energy and volume units in static cache
Convert.load(['energy', 'volume']);

// verify we can use volume
Convert.verifyUnit('m^3')

// returns the display name for volume
Convert.display('m^3')
```
