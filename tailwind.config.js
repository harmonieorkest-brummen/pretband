/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	safelist: ["animate-lamp-flicker"],
	theme: {
		extend: {
			colors: {
				"pret-red": "#E53433",
				"pret-yellow": "#EBB64D",
				"pret-dark": "#2A2324",
				"pret-white": "#FFFFFF",
			},
			borderRadius: {
				"4xl": "2rem",
				"5xl": "3rem",
			},
			fontFamily: {
				display: ["Bevellier", "sans-serif"],
				body: ["Fredoka", "sans-serif"],
			},
			animation: {
				"bounce-slow": "bounce 3s infinite",
				"pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				wiggle: "wiggle 1s ease-in-out infinite",
				// Like a dying lamp: long calm periods with irregular flickers + brief "off" moments.
				"lamp-flicker": "lampFlicker 2s infinite ease-in-out",
				float: "float 6s ease-in-out infinite",
				tilt: "tilt 10s infinite linear",
			},
			keyframes: {
				wiggle: {
					"0%, 100%": {
						"--pret-wiggle": "-3deg",
						transform:
							"translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) rotate(var(--pret-wiggle, 0deg)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
					},
					"50%": {
						"--pret-wiggle": "3deg",
						transform:
							"translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) rotate(var(--pret-wiggle, 0deg)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
					},
				},
				float: {
					"0%, 100%": {
						"--pret-float-y": "0px",
						transform:
							"translate(var(--tw-translate-x), var(--tw-translate-y)) translateY(var(--pret-float-y, 0px)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
					},
					"50%": {
						"--pret-float-y": "-20px",
						transform:
							"translate(var(--tw-translate-x), var(--tw-translate-y)) translateY(var(--pret-float-y, 0px)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
					},
				},
				tilt: {
					"0%, 50%, 100%": {
						"--pret-tilt": "0deg",
						transform:
							"translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) rotate(var(--pret-tilt, 0deg)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
					},
					"25%": {
						"--pret-tilt": "1deg",
						transform:
							"translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) rotate(var(--pret-tilt, 0deg)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
					},
					"75%": {
						"--pret-tilt": "-1deg",
						transform:
							"translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) rotate(var(--pret-tilt, 0deg)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
					},
				},
				lampFlicker: {
					"0%, 58%": {
						opacity: "1",
						filter:
							"drop-shadow(0 0 10px rgba(235, 182, 77, 0.55)) drop-shadow(0 0 26px rgba(235, 182, 77, 0.25))",
						textShadow: "0 0 15px rgba(235, 182, 77, 0.6)",
					},
					"59%": { opacity: "0.55", filter: "none", textShadow: "none" },
					"60%": {
						opacity: "1",
						filter: "drop-shadow(0 0 12px rgba(235, 182, 77, 0.65))",
						textShadow: "0 0 18px rgba(235, 182, 77, 0.75)",
					},
					"61%": { opacity: "0.12", filter: "none", textShadow: "none" },
					"62%": {
						opacity: "1",
						filter:
							"drop-shadow(0 0 10px rgba(235, 182, 77, 0.55)) drop-shadow(0 0 26px rgba(235, 182, 77, 0.25))",
						textShadow: "0 0 15px rgba(235, 182, 77, 0.6)",
					},
					"64%": { opacity: "0.02", filter: "none", textShadow: "none" },
					"66%": {
						opacity: "1",
						filter:
							"drop-shadow(0 0 16px rgba(235, 182, 77, 0.85)) drop-shadow(0 0 44px rgba(235, 182, 77, 0.35))",
						textShadow: "0 0 26px rgba(235, 182, 77, 0.95)",
					},
					"72%": { opacity: "0.35", filter: "none", textShadow: "none" },
					"74%": {
						opacity: "1",
						filter:
							"drop-shadow(0 0 12px rgba(235, 182, 77, 0.65)) drop-shadow(0 0 30px rgba(235, 182, 77, 0.25))",
						textShadow: "0 0 18px rgba(235, 182, 77, 0.75)",
					},
					"78%": { opacity: "0.06", filter: "none", textShadow: "none" },
					"80%": {
						opacity: "1",
						filter:
							"drop-shadow(0 0 10px rgba(235, 182, 77, 0.55)) drop-shadow(0 0 26px rgba(235, 182, 77, 0.25))",
						textShadow: "0 0 15px rgba(235, 182, 77, 0.6)",
					},
					"86%": { opacity: "0.25", filter: "none", textShadow: "none" },
					"88%, 100%": {
						opacity: "1",
						filter:
							"drop-shadow(0 0 10px rgba(235, 182, 77, 0.55)) drop-shadow(0 0 26px rgba(235, 182, 77, 0.25))",
						textShadow: "0 0 15px rgba(235, 182, 77, 0.6)",
					},
				},
			},
		},
	},
	plugins: [],
};
