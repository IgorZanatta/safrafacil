// /src/demo/components/TokenRenewPopup.tsx
import React from 'react';
import '../../styles/token-renew-popup.scss';

interface TokenRenewPopupProps {
    onRenew: () => void;
    onDismiss: () => void;
}

const TokenRenewPopup: React.FC<TokenRenewPopupProps> = ({ onRenew, onDismiss }) => (
    <div className="token-renew-popup">
        <p>Seu token está prestes a expirar. Deseja renovar?</p>
        <button onClick={onRenew}>Sim</button>
        <button onClick={onDismiss}>Não</button>
    </div>
);

export default TokenRenewPopup;
