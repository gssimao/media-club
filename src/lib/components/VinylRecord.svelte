<!-- A fixed material: the record stays black in either page theme. No animated paint. -->
<div class="vinyl-record" aria-hidden="true"></div>

<style>
	.vinyl-record {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		pointer-events: none;
		border: 1px solid rgb(var(--vinyl-edge));
		background:
			repeating-radial-gradient(
				circle at center,
				transparent 0 2px,
				rgb(255 255 255 / 0.045) 2.5px 3px,
				transparent 3.5px 5px
			),
			conic-gradient(
				from 25deg,
				transparent 0deg,
				rgb(255 255 255 / 0.14) 48deg,
				transparent 82deg 178deg,
				rgb(255 255 255 / 0.1) 222deg,
				transparent 258deg
			),
			rgb(var(--vinyl-base));
		box-shadow:
			inset 0 0 0 4px rgb(var(--vinyl-base)),
			inset 0 0 0 5px rgb(var(--vinyl-edge)),
			inset 0 0 28px rgb(0 0 0 / 0.5);
	}
</style>
