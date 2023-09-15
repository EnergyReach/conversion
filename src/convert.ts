import Big from 'big.js';
import { Group, Units, UnitCache, Value } from './types';
import UnitsLibrary from './units';
/**
 * The main conversion class used to perform various unit conversions according
 * to a specified collection of {@link Units}.
 */
export default class Convert {
  /** The default precision number after the decimal point used for all
   * post-conversion results. */
  public PRECISION = 3;

  /** The current precision number setting. */
  private _precision: number;
  /** A collection of all units which this conversion instance understands. */
  private _unitsCache: Record<string, UnitCache>;
  /** The source unit used for conversion. */
  private _unit?: string;
  /** The source number value used for conversion. */
  private _value?: Value;

  /** An internal instance of the Convert class used as a singleton and meant
   * for global object access. */
  private static _convert?: Convert;

  /**
   * Load unit definitions into Conversion cache. These definitions are used
   * to perform the actual unit conversions.
   *
   * @param {Units | Group | Group[]} units - The units to be loaded in
   *      cache or if string or string[] - the units group(s) to be loaded
   *      in cache.
   * @param {boolean} overwrite - Optional. Overwrite any existing unit
   *      definitions or corresponding unit definition duplicates.
   */
  public static load(
    units: Units | Group | Group[],
    overwrite?: boolean,
  ): Convert {
    if (!Convert._convert) {
      Convert._convert = new Convert({});
    }
    Convert._convert.load(units, overwrite);

    return Convert._convert;
  }

  /**
   * Clear the specified unit group from Conversion cache. If not specified,
   * unit cache will be emptied and only the default unit conversions as
   * specified in {@link Convert.DEFAULT_UNITS} will be left.
   *
   * @param {Group} group - Optional. The unit group we'd like to clear.
   */
  public static clear(group?: Group): void {
    if (Convert._convert) {
      Convert._convert.clear(group);
    }
  }

  /**
   * Given a unit definition, retrieve its display value.
   * Intended mainly for presentation purposes.
   *
   * @param {string} unit - The unit definition.
   * @return {number} - The display representation if any,
   *      or else return the unit definition itself.
   */
  public static display(unit: string): string {
    return Convert._convert ? Convert._convert.display(unit) : unit;
  }

  /**
   * Verify that a given unit definition is valid.
   *
   * @param {string} unit - The unit definition.
   * @throws {Error} - If the supplied unit definition is invalid.
   */
  public static verifyUnit(unit: string): void {
    if (!Convert._convert) {
      Convert._convert = new Convert();
    }
    Convert._convert.verifyUnit(unit);
  }

  /**
   * Check if a given unit definition is valid.
   *
   * @param {string} unit - The unit definition.
   * @returns {boolean} - If the supplied unit definition is invalid.
   */
  public static isValid(unit: string): boolean {
    if (!Convert._convert) {
      Convert._convert = new Convert();
    }
    return Convert._convert.isValid(unit);
  }

  /**
   * Create an instance of this class, by optionally specifying a list of unit
   * definitions. These definitions are used to perform the actual unit
   * conversions.
   *
   * @param {Units | Group | Group[]} units - Optional. The units to be
   *      loaded in cache or if string or string[] - the units group(s) to be
   *      loaded in cache. If not specified, {@link allUnits} will be loaded.
   */
  public constructor(units?: Units | Group | Group[]) {
    this._precision = this.PRECISION;
    this._unitsCache = {};
    this.load(units ? units : UnitsLibrary);
  }

  /**
   * Load unit definitions into Conversion cache. These definitions are used
   * to perform the actual unit conversions.
   *
   * @param {Units | Group | Group[]} units - The units to be loaded in
   *      cache or if string or string[] - the units group(s) to be loaded
   *      in cache.
   * @param {boolean} overwrite - Optional. Overwrite any existing unit
   *      definitions or corresponding unit definition duplicates.
   * @returns {this} - the current object class instance.
   */
  public load(units: Units | Group | Group[], overwrite?: boolean): this {
    // Prepare the unit object based on what we were provided
    let unitsObject: Units = {};
    if (typeof units == 'string') {
      unitsObject[units] = UnitsLibrary[units];
    } else if (Array.isArray(units)) {
      for (const group of units) {
        unitsObject[group] = UnitsLibrary[group];
      }
    } else {
      unitsObject = units;
    }

    // Once we have the units object prepared, load it into Convert's cache.
    for (const group in unitsObject) {
      for (const unitName in unitsObject[group]) {
        if (!overwrite && unitName in this._unitsCache) {
          throw Error(`Convert unit "${unitName}" is already defined.`);
        }
        this._unitsCache[unitName] = { group, ...unitsObject[group][unitName] };
      }
    }
    return this;
  }

  /**
   * Set the default precision after the decimal point.
   *
   * @param {number} precision - The precision after the decimal point.
   * @returns {this} - the current object class instance.
   */
  public precision(precision: number): this {
    this._precision = precision;
    return this;
  }

  /**
   * Clear the specified unit group from conversion cache. If no group is
   * specified, unit cache will be emptied.
   *
   * @param {Group} group - Optional. The unit group we'd like to clear.
   * @returns {this} - the current object class instance.
   */
  public clear(group?: Group): this {
    if (group) {
      Object.entries(this._unitsCache).forEach(([key, value]) => {
        if (value.group === group) {
          delete this._unitsCache[key];
        }
      });
    } else {
      this._unitsCache = {};
    }
    return this;
  }

  /**
   * Set the source conversion unit.
   *
   * @param {number} value - The source value.
   * @param {string} unit - The source unit definition.
   * @returns {this} - the current object class instance.
   * @throws {Error} - If the supplied unit definition is invalid.
   */
  public from(value: number, unit: string): this {
    this.verifyUnit(unit);
    this._unit = unit;
    this._value = new Big(value);
    return this;
  }

  /**
   * Convert to the destination unit definition and get the corresponding
   * resulting value after the conversion.
   *
   * @param {string} unit - The source unit definition.
   * @param {number} precision - Optional. Overwrite the class instance
   *      precision as specified in {@link Convert._precision} only for this
   *      conversion operation.
   * @returns {this} - the current object class instance.
   * @throws {Error} - If the source has not been configured or the supplied
   *      destination unit definition is invalid.
   */
  public to(unit: string, precision?: number): number {
    // Ensure conversion source is defined
    if (!this._value || !this._unit) {
      throw Error('Source unit or value are not specified.');
    }

    // Ensure the specified unit to convert to is valid
    this.verifyUnit(unit);
    const source = this._unitsCache[this._unit];
    const destination = this._unitsCache[unit];
    if (source.group !== destination.group) {
      throw Error(`Unit ${unit} cannot be converted to ${this._unit}.`);
    }
    // This is used in case UnitDefinition.base is not specified
    const DEFAULT_BASE = 1;
    const to_base = source.to
      ? source.to(this._value)
      : this._value.mul(source.base || DEFAULT_BASE);
    const result: Big = destination.from
      ? destination.from(to_base)
      : to_base.div(destination.base || DEFAULT_BASE);
    return result
      .round(precision || this._precision, Big.roundHalfUp)
      .toNumber();
  }

  /**
   * Given a numbered value, perform an `addition` arithmetic operation
   * against the source.
   *
   * @param {number} value - The value with which to perform the operation.
   * @returns {this} - the current object class instance.
   * @throws {Error} - If the source has not been configured.
   */
  public add(value: number): this {
    if (!this._value) {
      throw Error('Source value is not specified.');
    }
    this._value = this._value.add(value);
    return this;
  }

  /**
   * Given a numbered value, perform a `subtraction` arithmetic operation
   * against the source.
   *
   * @param {number} value - The value with which to perform the operation.
   * @returns {this} - the current object class instance.
   * @throws {Error} - If the source has not been configured.
   */
  public sub(value: number): this {
    if (!this._value) {
      throw Error('Source value is not specified.');
    }
    this._value = this._value.sub(value);
    return this;
  }

  /**
   * Given a numbered value, perform a `multiplication` arithmetic operation
   * against the source.
   *
   * @param {number} value - The value with which to perform the operation.
   * @returns {this} - the current object class instance.
   * @throws {Error} - If the source has not been configured.
   */
  public mul(value: number): this {
    if (!this._value) {
      throw Error('Source value is not specified.');
    }
    this._value = this._value.mul(value);
    return this;
  }

  /**
   * Given a numbered value, perform a `division` arithmetic operation
   * against the source.
   *
   * @param {number} value - The value with which to perform the operation.
   * @returns {this} - the current object class instance.
   * @throws {Error} - If the source has not been configured.
   */
  public div(value: number): this {
    if (!this._value) {
      throw Error('Source value is not specified.');
    }
    this._value = this._value.div(value);
    return this;
  }

  /**
   * Get the current numbered value after any arithmetic operations or
   * conversions have been performed.
   *
   * @param {number} precision - Optional. Overwrite the class instance
   *      precision as specified in {@link Convert._precision} only for this
   *      conversion operation.
   * @returns {this} - the current object class instance.
   * @throws {Error} - If the source has not been configured.
   */
  public value(precision?: number): number {
    if (!this._value) {
      throw Error('Source value is not specified.');
    }
    const p = precision || this._precision;
    return this._value.round(p, Big.roundHalfUp).toNumber();
  }

  /**
   * Given a unit definition, retrieve its display value.
   * Intended mainly for presentation purposes.
   *
   * @param {string} unit - The unit definition.
   * @return {number} - The display representation if any,
   *      or else return the unit definition itself.
   */
  public display(unit: string): string {
    const unitRecord = this._unitsCache[unit];
    if (!unitRecord) {
      return '';
    }
    if (unitRecord.display !== undefined) {
      return unitRecord.display;
    } else {
      return unit;
    }
  }

  /**
   * Verify that a given unit definition is valid.
   *
   * @param {string} unit - The unit definition.
   * @throws {Error} - If the supplied unit definition is invalid.
   */
  public verifyUnit(unit: string): void {
    if (!unit) {
      throw Error(`No unit was specified.`);
    }
    if (!Object.keys(this._unitsCache).includes(unit)) {
      throw Error(`Unit "${unit}" is not recognized.`);
    }
  }

  /**
   * Check if a given unit definition is valid.
   *
   * @param {string} unit - The unit definition.
   * @returns {boolean} - True if valid, False otherwise.
   */
  public isValid(unit: string): boolean {
    return !!unit && Object.keys(this._unitsCache).includes(unit);
  }
}
