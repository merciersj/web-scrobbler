import Vue from 'vue';
import InlineSvg from 'vue-inline-svg';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';

import 'ui/base.css';

import root from './root.vue';

import { L } from 'ui/i18n2.js';

Vue.component('inline-svg', InlineSvg);
Vue.prototype.L = L;

new Vue({
	render: (h) => h(root),
}).$mount('#page');
