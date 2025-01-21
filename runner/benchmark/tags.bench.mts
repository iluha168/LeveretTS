const benchTag = (name: string, ...args: string[]) => {
	Deno.bench(
		`%t ${name}`,
		(b) => {
			const cmd = new Deno.Command("deno", {
				args: [
					"run",
					"-A",
					"runner/runner.mts",
					`tags/${name}.mts`,
				].concat(args),
			})
			b.start()
			cmd.outputSync()
			b.end()
		},
	)
}

benchTag("stats")
benchTag("megadump", "0-999999999")
