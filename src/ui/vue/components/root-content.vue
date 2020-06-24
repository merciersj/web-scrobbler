<template>
	<div class="tab-content">
		<accounts-tab />
		<options-tab />
		<tracks-tab />
		<storage-tab />
		<faq-tab />
		<about-tab />
	</div>
</template>

<style>
.options-section {
	margin-bottom: 2rem;
}

.options-section:last-child {
	margin-bottom: 1rem;
}
</style>

<script>
import AboutTab from './tabs/about-tab.vue';
import AccountsTab from './tabs/accounts-tab.vue';
import FaqTab from './tabs/faq-tab.vue';
import OptionsTab from './tabs/options-tab.vue';
import TracksTab from './tabs/tracks-tab.vue';
import StorageTab from './tabs/storage-tab.vue';

export default {
	components: {
		AboutTab,
		AccountsTab,
		FaqTab,
		OptionsTab,
		TracksTab,
		StorageTab,
	},
};
</script>
