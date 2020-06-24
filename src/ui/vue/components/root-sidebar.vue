<template>
	<div class="sidebar">
		<div class="nav collapse sidebar-links mb-4" id="sidebar-tab">
			<a
				class="nav-link"
				id="sidebar-accounts-tab"
				data-toggle="pill"
				href="#sidebar-accounts"
				role="tab"
				aria-controls="sidebar-accounts"
				aria-selected="true"
			>
				<inline-svg
					src="/icons/people.svg"
					fill="currentColor"
				></inline-svg>
				<span>{{ L('accountsSidebarTitle') }}</span>
			</a>
			<a
				class="nav-link"
				id="sidebar-options-tab"
				data-toggle="pill"
				href="#sidebar-options"
				role="tab"
				aria-controls="sidebar-options"
				aria-selected="false"
			>
				<inline-svg
					src="/icons/gear.svg"
					fill="currentColor"
				></inline-svg>
				<span>{{ L('optionsSidebarTitle') }}</span>
			</a>
			<a
				class="nav-link"
				id="sidebar-edited-tracks-tab"
				data-toggle="pill"
				href="#sidebar-edited-tracks"
				role="tab"
				aria-controls="sidebar-options"
				aria-selected="false"
			>
				<inline-svg
					src="/icons/music-note-list.svg"
					fill="currentColor"
				></inline-svg>
				<span>{{ L('tracksSidebarTitle') }}</span>
			</a>
			<a
				class="nav-link"
				id="sidebar-storage-tab"
				data-toggle="pill"
				href="#sidebar-storage"
				role="tab"
				aria-controls="sidebar-storage"
				aria-selected="false"
			>
				<inline-svg
					src="/icons/music-note-list.svg"
					fill="currentColor"
				></inline-svg>
				<span>{{ L('storageSidebarTitle') }}</span>
			</a>
			<a
				class="nav-link"
				id="sidebar-faq-tab"
				data-toggle="pill"
				href="#sidebar-faq"
				role="tab"
				aria-controls="sidebar-faq"
				aria-selected="false"
			>
				<inline-svg
					src="/icons/question-circle.svg"
					fill="currentColor"
				></inline-svg>
				<span>{{ L('faqSidebarTitle') }}</span>
			</a>
			<a
				class="nav-link active"
				id="sidebar-about-tab"
				data-toggle="pill"
				href="#sidebar-about"
				role="tab"
				aria-controls="sidebar-about"
				aria-selected="false"
			>
				<inline-svg
					src="/icons/info-circle.svg"
					fill="currentColor"
				></inline-svg>
				<span>{{ L('aboutSidebarTitle') }}</span>
			</a>
		</div>
	</div>
</template>

<style>
.sidebar-links a {
	color: rgba(0, 0, 0, 0.85);
}

.sidebar-links a:hover {
	background-color: rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	color: var(--color-active);
}

.sidebar-links .active {
	color: var(--color-accent);
	font-weight: 600;
}

.nav-link svg {
	height: 1.5rem;
	margin-right: 0.25rem;
	vertical-align: top;
	width: 1.5rem;
}
</style>
