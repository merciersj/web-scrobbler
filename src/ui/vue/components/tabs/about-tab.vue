<template>
	<div
		class="tab-pane fade show active"
		id="sidebar-about"
		role="tabpanel"
		aria-labelledby="sidebar-about-tab"
	>
		<div class="options-section">
			<h5>{{ L('aboutSidebarTitle') }}</h5>
			<p>{{ L('aboutExtensionDesc') }}</p>
		</div>

		<div class="options-section">
			<h5>{{ L('aboutLinksTitle') }}</h5>
			<ul>
				<li v-for="(link, stringId) in links" :key="stringId">
					<a target="_blank" :href="link">
						{{ L(stringId) }}
					</a>
				</li>
			</ul>
		</div>

		<div class="options-section">
			<h5>{{ L('aboutShowSomeLoveTitle') }}</h5>
			<p>{{ L('aboutShowSomeLoveText1') }}</p>
			<p>{{ L('aboutShowSomeLoveText2') }}</p>

			<div class="text-center">
				<a href="https://ko-fi.com/R6R21HYBD" target="_blank">
					<img
						src="https://www.ko-fi.com/img/githubbutton_sm.svg"
						alt="Support me on Ko-fi"
					/>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import { runtime } from 'webextension-polyfill';
import { getPrivacyPolicyFilename } from 'util/util-browser';

const GITHUB_RELEASES_URL =
	'https://github.com/web-scrobbler/web-scrobbler/releases/tag';
const GITHUB_RAW_SRC =
	'https://github.com/web-scrobbler/web-scrobbler/blob/master/src/';

const extVersion = runtime.getManifest().version;

const links = {
	aboutReleaseNotesTitle: `${GITHUB_RELEASES_URL}/v${extVersion}`,
	aboutFullChangelogTitle:
		'https://github.com/web-scrobbler/web-scrobbler/releases',
	aboutContributorsTitle:
		'https://github.com/web-scrobbler/web-scrobbler/graphs/contributors',
};

async function getPrivacyPolicyUrl() {
	const privacyPolicyFile = await getPrivacyPolicyFilename();
	return `${GITHUB_RAW_SRC}/${privacyPolicyFile}`;
}

export default {
	data() {
		return {
			links,
		};
	},
	created() {
		this.loadLinks();
	},
	methods: {
		async loadLinks() {
			this.$set(
				this.links,
				'aboutPrivacyPolicyTitle',
				await getPrivacyPolicyUrl()
			);
		},
	},
};
</script>
