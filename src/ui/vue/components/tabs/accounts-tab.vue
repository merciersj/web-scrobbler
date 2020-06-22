<template>
	<div
		class="tab-pane fade"
		id="sidebar-accounts"
		role="tabpanel"
		aria-labelledby="sidebar-accounts-tab"
	>
		<div
			class="options-section"
			v-for="(data, scrobblerId) in accountsData"
			:key="scrobblerId"
		>
			<h5>{{ data.scrobbler.getLabel() }}</h5>

			<div class="mb-2">
				<template v-if="data.isSignedIn">
					{{ L('accountsSignedInAs', data.userName) }}
				</template>
				<template v-else>
					{{ L('accountsNotSignedIn') }}
				</template>
			</div>

			<div>
				<a class="card-link" href="#" v-if="data.hasUserProperties">
					{{ L('accountsScrobblerProps') }}
				</a>
				<template v-if="data.isSignedIn">
					<a
						class="card-link"
						target="_blank"
						:href="data.profileUrl"
						v-if="data.hasProfileUrl"
					>
						{{ L('accountsProfile') }}
					</a>
					<a
						class="card-link"
						href="#"
						@click="signOut(data.scrobbler)"
					>
						{{ L('accountsSignOut') }}
					</a>
				</template>
				<template v-else>
					<a
						class="card-link"
						href="#"
						@click="signIn(data.scrobbler)"
					>
						{{ L('accountsSignIn') }}
					</a>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
import { extension, tabs } from 'webextension-polyfill';
const { getCurrentTab } = require('util/util-browser');

const { webScrobbler } = extension.getBackgroundPage();

const ScrobbleService = webScrobbler.getScrobbleService();

async function makeAccountsDataFromScrobbler(scrobbler) {
	let userName = null;
	let profileUrl = null;
	let isSignedIn = false;
	let hasProfileUrl = false;

	const hasUserProperties = scrobbler.getUsedDefinedProperties().length > 0;

	try {
		const { sessionName } = await scrobbler.getSession();

		profileUrl = await scrobbler.getProfileUrl();
		userName = sessionName;

		isSignedIn = true;
		hasProfileUrl = profileUrl !== null;
	} catch (err) {
		// Do nothing
	}

	return {
		isSignedIn,
		hasProfileUrl,
		hasUserProperties,
		profileUrl,
		scrobbler,
		userName,
	};
}

export default {
	data() {
		return {
			accountsData: {},
		};
	},
	created() {
		this.setupEventListeners();
		this.loadAccounts();
	},
	methods: {
		async loadAccounts() {
			const accountsData = {};
			const scrobblers = ScrobbleService.getRegisteredScrobblers();

			for (const scrobbler of scrobblers) {
				accountsData[
					scrobbler.getId()
				] = await makeAccountsDataFromScrobbler(scrobbler);
			}

			this.accountsData = accountsData;
		},

		async setupEventListeners() {
			const tab = await getCurrentTab();
			tabs.onActivated.addListener((activeInfo) => {
				if (tab.id === activeInfo.tabId) {
					this.loadAccounts();
				}
			});
		},

		signIn(scrobbler) {
			webScrobbler.authenticateScrobbler(scrobbler);
		},

		async signOut(scrobbler) {
			await scrobbler.signOut();

			this.$set(
				this.accountsData,
				scrobbler.getId(),
				await makeAccountsDataFromScrobbler(scrobbler)
			);
		},
	},
};
</script>
