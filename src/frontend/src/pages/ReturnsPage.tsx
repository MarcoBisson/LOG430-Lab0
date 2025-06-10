import { useState } from 'react';
import { processReturn } from '../APIs/ReturnAPI';

export default function ReturnsPage() {
    const [saleId, setSaleId] = useState(0);
    const [message, setMessage] = useState('');

    const submitReturn = async () => {
        try {
            await processReturn(saleId);
            setMessage(`Retour traité pour la vente ${saleId}.`);
        } catch (e: any) {
            setMessage(`Erreur: ${e.message}`);
        }
    };

    return (
        <div>
            <h1>Traiter un retour</h1>
            <div>
                Sale ID: <input type="number" value={saleId} onChange={e => setSaleId(+e.target.value)} />
                <button onClick={submitReturn}>Annuler la vente</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}