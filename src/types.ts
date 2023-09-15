import Big from 'big.js';

/**
 * A definition for the value number which is used in conversions.
 */
export type Value = Big;

/**
 * A definition for all unit groups which are used in conversions.
 */
export type Group =
  | 'boolean'
  | 'current'
  | 'energyTh'
  | 'energy'
  | 'flow'
  | 'percent'
  | 'powerTh'
  | 'power'
  | 'pressure'
  | 'temperature'
  | 'voltage'
  | 'volume';

/**
 * A unit conversion definition class, which specifies the necessary
 * information, which {@link Convert} needs in order to perform a
 * particular conversion.
 */
export type UnitDefinition = {
  /** Optional. If this is a basic conversion, specify the numeric multiplier
   * in order to reach the base unit. E.g. If we select `m` to be the base
   * unit for meter conversion, then specifying the base for `cm` will be 0.01,
   * while `km` will be 1000. Specifying base is optional here because the
   * selected base value (in this case `m`) does not need to be specified. */
  base?: number;
  /** Optional. If this is not a basic conversion, specify a function which
   * represents the formula to convert to the base unit. */
  to?: (value: Value) => Value;
  /** Optional. If this is not a basic conversion, specify a function which
   * represents the formula to convert from the base unit. */
  from?: (value: Value) => Value;
  /** Optional. The display string which should be used for this particular
   * definition. Intended mainly for presentation purposes. */
  display?: string;
};

/**
 * A collection of unit definitions within a single group where key is the
 * unit name and value is the corresponding unit definition.
 */
export type GroupDefinition = Record<string, UnitDefinition>;

/**
 * A collection of unit group definitions where key is the group name and
 * value is the corresponding group definition.
 */
export type Units = Record<string, GroupDefinition>;

/**
 * A unit conversion definition class, which specifies the necessary
 * information, which {@link Convert} needs in order to perform a
 * particular conversion.
 */
export type UnitCache = {
  /** The unit definitions group to which this definition instance belongs
   * to. */
  group: string;
  /** Optional. If this is a basic conversion, specify the numeric multiplier
   * in order to reach the base unit. E.g. If we select `m` to be the base
   * unit for meter conversion, then specifying the base for `cm` will be 0.01,
   * while `km` will be 1000. Specifying base is optional here because the
   * selected base value (in this case `m`) does not need to be specified. */
  base?: number;
  /** Optional. If this is not a basic conversion, specify a function which
   * represents the formula to convert to the base unit. */
  to?: (value: Value) => Value;
  /** Optional. If this is not a basic conversion, specify a function which
   * represents the formula to convert from the base unit. */
  from?: (value: Value) => Value;
  /** Optional. The display string which should be used for this particular
   * definition. Intended mainly for presentation purposes. */
  display?: string;
};
