<template>
	<header class="navbar navbar-expand navbar-dark bg-dark sticky-top">
		<nav class="container" aria-label="Main navigation">
			<span class="navbar-brand">Web Scrobbler</span>

			<button
				class="navbar-toggler"
				type="button"
				data-toggle="collapse"
				data-target="#sidebar-tab"
				aria-controls="sidebar-tab"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon"></span>
			</button>

			<ul class="navbar-nav ml-sm-auto">
				<li class="nav-item">
					<a
						class="contact-link"
						href="https://github.com/web-scrobbler"
						target="_blank"
						rel="noopener"
						aria-label="GitHub"
					>
						<inline-svg
							src="/icons/github.svg"
							fill="currentColor"
						></inline-svg
					></a>
				</li>
				<li class="nav-item">
					<a
						class="contact-link"
						href="https://twitter.com/web_scrobbler"
						target="_blank"
						rel="noopener"
						aria-label="GitHub"
					>
						<inline-svg
							src="/icons/twitter.svg"
							fill="currentColor"
						></inline-svg>
					</a>
				</li>
				<li class="nav-item">
					<button
						class="btn d-md-none p-0 ml-4 contact-link"
						type="button"
						data-toggle="collapse"
						data-target="#sidebar-tab"
						aria-controls="sidebar-tab"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<inline-svg
							src="/icons/list.svg"
							fill="currentColor"
						></inline-svg>
					</button>
				</li>
			</ul>
		</nav>
	</header>
</template>

<style>
.contact-link {
	color: rgba(255, 255, 255, 0.55);
	padding-left: 0.5rem;
	padding-right: 0.5rem;
}
.contact-link:hover {
	color: rgba(255, 255, 255, 0.75);
}
.contact-link svg {
	height: 1.5rem;
	width: 1.5rem;
}
</style>
