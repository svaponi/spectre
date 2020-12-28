import {animate} from './spectre';
// import {animate} from './demo';
import * as $ from 'jquery';

$(document).ready(function () {
    requestAnimationFrame(animate);
});
