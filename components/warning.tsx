import { config } from '../sheetReader/definitions/config';
import Image from 'next/image';

export default function Warning() {
	if (config.ganzRlpEineWarnstufe)
		return (
			<div
				className="warning"
				style={{
					backgroundColor: '#ffc107',
					border: '1px solid #ffc107',
					borderRadius: '4px',
					color: '#000',
					padding: '10px',
					margin: '10px',
					textAlign: 'center',
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
				}}
			>
				<Image
					src="https://upload.wikimedia.org/wikipedia/commons/1/17/Warning.svg"
					width="50px"
					height="50px"
				/>
				Momentan gelten für alle Kreise die Warnstufe von Rheinland-Pfalz!
				<Image
					src="https://upload.wikimedia.org/wikipedia/commons/1/17/Warning.svg"
					width="50px"
					height="50px"
				/>
			</div>
		);

	return null;
}
