<template>
	<div>
		<root-header />
		<div class="container my-4 options-layout">
			<root-sidebar />
			<div class="content">
				<root-content />
			</div>
		</div>
	</div>
</template>

<style>
/* Always show scrollbar */

html {
	overflow-y: scroll;
}
.modal-open {
	padding-right: 0px !important;
}

@media (min-width: 768px) {
	.options-layout {
		display: grid;
		grid-template-areas: 'sidebar content';
		grid-template-columns: 1fr 3fr;
	}

	.sidebar {
		position: fixed;
	}

	.sidebar-links {
		display: block !important;
	}
}

.sidebar {
	grid-area: sidebar;
}

.content {
	grid-area: content;
	padding-left: 1rem;
	padding-right: 1rem;
}

.container {
	max-width: 768px;
}
</style>

<script>
import RootHeader from './components/root-header.vue';
import RootContent from './components/root-content.vue';
import RootSidebar from './components/root-sidebar.vue';

export default {
	components: {
		RootContent,
		RootHeader,
		RootSidebar,
	},
};
</script>
