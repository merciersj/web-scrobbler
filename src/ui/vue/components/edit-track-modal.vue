<template>
	<div class="modal fade" :id="modalId">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{{ L('editSongTitle') }}</h5>
					<button
						type="button"
						class="close"
						data-dismiss="modal"
						aria-label="Close"
					>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="mb-3">
						<label class="form-label">{{ L('artistTitle') }}</label>
						<input
							required
							type="text"
							class="form-control"
							v-model="artistToEdit"
							:placeholder="L('infoArtistPlaceholder')"
						/>
					</div>
					<div class="mb-3">
						<label class="form-label">{{ L('trackTitle') }}</label>
						<input
							required
							type="text"
							class="form-control"
							v-model="trackToEdit"
							:placeholder="L('infoTrackPlaceholder')"
						/>
					</div>
					<div class="mb-3">
						<label class="form-label">{{ L('albumTitle') }}</label>
						<input
							type="text"
							class="form-control"
							v-model="albumToEdit"
							:placeholder="L('infoAlbumPlaceholder')"
						/>
					</div>
					<div class="mb-3">
						<label class="form-label">{{
							L('albumArtistTitle')
						}}</label>
						<input
							type="text"
							class="form-control"
							v-model="albumArtistToEdit"
							:placeholder="L('infoAlbumArtistPlaceholder')"
						/>
					</div>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						data-dismiss="modal"
					>
						{{ L('buttonCancel') }}
					</button>
					<button
						type="button"
						class="btn btn-primary"
						data-dismiss="modal"
						@click="submitChanges"
					>
						{{ L('buttonOk') }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
const propsToDataMap = {
	artist: 'artistToEdit',
	track: 'trackToEdit',
	album: 'albumToEdit',
	albumArtist: 'albumArtistToEdit',
};

function createWatchers() {
	const watchers = {};

	for (const propName in propsToDataMap) {
		watchers[propName] = function updateDataValue(newValue) {
			const dataName = propsToDataMap[propName];
			this[dataName] = newValue;
		};
	}

	return watchers;
}

export default {
	props: ['modalId', ...Object.keys(propsToDataMap)],
	watch: createWatchers(),
	data() {
		const data = {};

		for (const dataName of Object.values(propsToDataMap)) {
			data[dataName] = null;
		}

		return data;
	},
	methods: {
		submitChanges() {
			const songInfo = this.createEditedSongInfo();

			if (songInfo.artist && songInfo.track) {
				this.$emit('on-track-edited', songInfo);
			}
		},

		createEditedSongInfo() {
			const songInfo = {};

			for (const prop in propsToDataMap) {
				const dataName = propsToDataMap[prop];
				songInfo[prop] = this[dataName];
			}

			return songInfo;
		},
	},
};
</script>
