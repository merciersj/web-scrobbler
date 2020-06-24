<template>
	<div
		class="tab-pane fade"
		id="sidebar-storage"
		role="tabpanel"
		aria-labelledby="sidebar-storage-tab"
	>
		<div class="options-section">
			<h5>{{ L('storageScrobbleStorageTitle') }}</h5>

			<template v-if="hasTracks()">
				<p>{{ L('storageScrobbleStorageDescDefault') }}</p>
			</template>
			<template v-else>
				<p>{{ L('storageScrobbleStorageDescNoSongs') }}</p>
			</template>

			<div class="mb-4">
				<a href="#" class="card-link" @click="importTracks()">{{
					L('buttonImport')
				}}</a>
				<template v-if="hasTracks()">
					<a href="#" class="card-link" @click="exportTracks()">
						{{ L('buttonExport') }}
					</a>
					<a href="#" class="card-link" @click="clearTracks()">
						{{ L('buttonClear') }}
					</a>
				</template>
			</div>
		</div>

		<div
			class="alert alert-danger alert-dismissible"
			role="alert"
			v-if="isAlertVisible"
		>
			{{ alertMessage }}
			<button
				type="button"
				class="close"
				aria-label="Close"
				@click="isAlertVisible = false"
			>
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<div class="options-section" v-if="hasTracks()">
			<h5>{{ L('storageScrobbleStorageCount', getTracksCount()) }}</h5>
			<div class="mb-4">
				<div
					class="mb-4"
					v-for="({ songInfo, scrobblerIds }, entryId) in tracks"
				>
					<div
						class="info-container mb-2 d-flex justify-content-between align-items-center"
					>
						<div class="scrobbler-labels">
							<span
								class="badge badge-primary"
								v-bind:class="{ [scrobblerId]: true }"
								v-for="scrobblerId in scrobblerIds"
							>
								{{ getScrobblerLabel(scrobblerId) }}
							</span>
						</div>
						<small class="date text-muted">
							{{ getDateString(songInfo.timestamp) }}
						</small>
					</div>
					<track-info
						:artist="songInfo.artist"
						:track="songInfo.track"
						:album="songInfo.album"
					/>
					<div>
						<a
							class="card-link"
							data-toggle="modal"
							:href="`#${editTrackModalId}`"
							@click="prepareEditSong(entryId)"
						>
							{{ L('buttonEdit') }}
						</a>
						<a
							class="card-link"
							href="#"
							@click="scrobbleEntry(entryId)"
						>
							{{ L('buttonScrobble') }}
						</a>
						<a
							class="card-link"
							href="#"
							@click="removeEntry(entryId)"
						>
							{{ L('buttonRemove') }}
						</a>
					</div>
				</div>
			</div>
		</div>

		<edit-track-modal
			:modal-id="editTrackModalId"
			:artist="editedEntry.songInfo.artist"
			:track="editedEntry.songInfo.track"
			:album="editedEntry.songInfo.album"
			:albumArtist="editedEntry.songInfo.albumArtist"
			@on-track-edited="updateTrack($event)"
		/>
	</div>
</template>

<style>
.scrobbler-labels .badge {
	margin-right: 0.25rem;
}

.lastfm {
	background-color: var(--color-accent);
}

.librefm {
	background-color: #f67900;
}

.listenbrainz {
	background-color: #353070;
}

@media (max-width: 500px) {
	.date {
		display: none;
	}
}
</style>

<script>
import EditTrackModal from './../edit-track-modal.vue';
import TrackInfo from './track-info.vue';

import { exportData, importData } from 'ui/util';

const { extension } = require('webextension-polyfill');

const ScrobbleStorage = require('storage/scrobble-storage');
const { RESULT_OK } = require('object/api-call-result');

const { webScrobbler } = extension.getBackgroundPage();
const ScrobbleService = webScrobbler.getScrobbleService();

const scrobblerMap = {};
for (const scrobbler of ScrobbleService.getRegisteredScrobblers()) {
	scrobblerMap[scrobbler.getId()] = scrobbler.getLabel();
}

const exportFileName = 'scrobble-storage.json';

export default {
	data() {
		return {
			tracks: {},

			editTrackModalId: 'edit-track-modal',
			editedEntry: { entryId: null, songInfo: {} },

			alertMessage: null,
			isAlertVisible: false,
		};
	},
	created() {
		this.loadTracks();
	},
	components: {
		EditTrackModal,
		TrackInfo,
	},
	methods: {
		async loadTracks() {
			this.tracks = await ScrobbleStorage.getData();
		},

		async exportTracks() {
			exportData(this.tracks, exportFileName);
		},

		async importTracks() {
			const data = await importData();

			this.tracks = data;
			await this.saveTracks();
		},

		async saveTracks() {
			await ScrobbleStorage.saveData(this.tracks);
		},

		showError(text) {
			this.alertMessage = text;
			this.isAlertVisible = true;
		},

		getDateString(timestamp) {
			return new Date(timestamp * 1000).toLocaleString();
		},

		getScrobblerLabel(scrobblerId) {
			return scrobblerMap[scrobblerId];
		},

		getTracksCount() {
			return Object.keys(this.tracks).length;
		},

		hasTracks() {
			return this.getTracksCount() > 0;
		},

		async clearTracks() {
			this.tracks = {};
			await ScrobbleStorage.clear();
		},

		prepareEditSong(entryId) {
			const { songInfo } = this.tracks[entryId];
			this.editedEntry = { entryId, songInfo };
		},

		async scrobbleEntry(entryId) {
			const { songInfo, scrobblerIds } = this.tracks[entryId];
			const results = await ScrobbleService.scrobbleWithScrobblers(
				songInfo,
				scrobblerIds
			);

			const okScrobblersIds = [];
			const failedScrobblerIds = [];

			for (const result of results) {
				const scrobblerId = result.getScrobblerId();

				if (result.is(RESULT_OK)) {
					okScrobblersIds.push(scrobblerId);
				} else {
					failedScrobblerIds.push(scrobblerId);
				}
			}

			const areAllResultsOk = okScrobblersIds.length === results.length;

			if (areAllResultsOk) {
				this.removeEntry(entryId);
			} else {
				const isNeedToUpdateScrobblerIds = okScrobblersIds.length > 0;
				if (isNeedToUpdateScrobblerIds) {
					await this.updateScrobblerIds(entryId, failedScrobblerIds);
				}

				const scrobblerLabels = this.getScrobblerLabels(
					failedScrobblerIds
				);
				const labelsList = scrobblerLabels.join(', ');

				this.showError(this.L('unableToScrobble', labelsList));
			}
		},

		async removeEntry(entryId) {
			this.$delete(this.tracks, entryId);
			await this.saveTracks();
		},

		async updateScrobblerIds(entryId, scrobblerIds) {
			const { songInfo } = this.tracks[entryId];

			this.$set(this.tracks, entryId, {
				songInfo,
				scrobblerIds,
			});

			await this.saveTracks();
		},

		async updateTrack(songInfo) {
			const entryId = this.editedEntry.entryId;

			const { scrobblerIds } = this.tracks[entryId];

			this.$set(this.tracks, entryId, {
				songInfo,
				scrobblerIds,
			});

			await this.saveTracks();
		},
	},
};
</script>
