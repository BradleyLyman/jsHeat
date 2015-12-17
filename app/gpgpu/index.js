'use strict';
/**
 * Exposes the Kernel and DataFrame methods.
 * @module gpgpu
 **/
let DataFrame = require('./dataFrame.js'),
    Kernel    = require('./kernel.js');

module.exports.DataFrame = DataFrame;
module.exports.Kernel    = Kernel;
