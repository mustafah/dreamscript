function convertParams(input: string): string[] {
    const lines = input.split('\n');
    const params: string[] = [];
    const keysToSpot = [
        'Input Resolution',
        'Created',
        'Pipeline',
        'Seed',
        'Preset',
        'PhotoReal',
        'Model',
        'Init Strength',
        'RAW Mode'
    ];

    let currentValue = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
		if (!line) continue;
		console.log(`*'${line}'`);
        if (keysToSpot.includes(line)) {
            if (currentValue !== '') {
                params.push(currentValue);
                currentValue = '';
            }
            const valueLines: string[] = [];
            let j = i + 1;
            while (j < lines.length && !keysToSpot.includes(lines[j].trim())) {
				const value = lines[j].trim();
				if (value)
					valueLines.push(value);
                j++;
            }
            currentValue = `~ ${line} = ${valueLines.join(' ')}`;
            i = j - 1;
        }
    }

    if (currentValue !== '') {
        params.push(currentValue);
    }

    return params;
}

// Test
const input = `

Input Resolution


568 x 1016px


Created

18/03/24 at 4:54 PM
Pipeline
Alchemy
V2
Seed
488756224
Preset
Bokeh
PhotoReal
On
Model
Leonardo Vision XL
Init Strength




No init image
RAW Mode
Off`;

const result = convertParams(input);
console.log(result);
