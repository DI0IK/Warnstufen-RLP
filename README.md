# Warnstufen RLP

## How it works

1. Fetches the latest version of the Excel file from lua.rlp.de

2. Parses the Excel file

3. iterates over the days and calculates the level of each attribute

4. Makes sure 2 or more attributes are higher than the currently checked Level

5. Set Warnstufe to the highest matching level

## How to use the API

### Data

Request:
GET https://www.warnzahl-rlp.de/api/v2/data

Response:

```json
{
	"data": {
		"**districtName**": {
			"**dd.mm.yyyy**": {
				"Inzidenz7Tage": "number",
				"Hospitalisierung7Tage": "number",
				"IntensivbettenProzent": "number",
				"Warnstufe": "1|2|3",
				"Versorgungsgebiet": "string"
			}
		}
	}
}
```

### Districts

Request:
GET https://www.warnzahl-rlp.de/api/v2/districts

```json
[
    "**districtName1**",
    "**districtName2**",
    ...

]
```

## How to Contribute

1. Fork the repository
2. Clone your fork:
   `git clone [yourUsername]/Warnstufen-RLP`
3. Create a new branch:
   `git checkout -b [yourBranchName]`
4. Edit the code
5. Commit your changes:
   `git commit -am "[yourCommitMessage]"`
6. Push your changes:
   `git push origin [yourBranchName]`
7. Open an Pull Request on GitHub
8. Wait for someone to review your Pull Request
9. If everything is fine, they will merge your Pull Request else they will tell you what needs to be done

## License

    <Warnstufen RLP>
    Copyright (C) 2021 Dominik Stahl

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
