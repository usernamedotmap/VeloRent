import QRCode from "react-qr-code";


const QRCodeComponent = (QRCode as any).default || QRCode;

interface Props {
    bikeId: string;
    serialNumber: string;
    bikeName: string;
    size?: number;
    showPrint?: boolean;
}

export default function BikeQrCode({ bikeId, serialNumber, bikeName, size = 200, showPrint = false }: Props) {

    // qr encoes the booking qurl 
    const bookingUrl = `${window.location.origin}/bikes/${bikeId}`;

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const htmlContent = `
             <html>k
        <head>
          <title>QR Code - ${bikeName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
              border: 2px solid #000;
              border-radius: 12px;
            }
            h2 { margin: 0 0 8px; font-size: 18px; }
            p  { margin: 0 0 20px; color: #666; font-size: 14px; }
            .serial { 
              margin-top: 16px; 
              font-family: monospace; 
              font-size: 16px;
              font-weight: bold;
            }
            .instruction {
              margin-top: 8px;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🚲 ${bikeName}</h2>
            <p>VeloRent Bike Rental</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingUrl)}" />
            <div class="serial">#${serialNumber}</div>
            <div class="instruction">Scan to book this bike</div>
          </div>
        </body>
      </html>
        `;

        printWindow.document.documentElement.innerHTML = htmlContent;
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }


    return (
        <div className="flex flex-col itmes-center gap-4">
            {/* qr code */}
            <div className="bg-white p-4 rounded-2xl border-2 border-[hsl(var(--border))] shadow-sm">
                <QRCodeComponent
                    value={bookingUrl}
                    size={size}
                    level="H"
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
            </div>

            {/* labels */}
            <div className="text-center">   
                <p className="font-bold text-[hsl(var(--foreground))]">{bikeName}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                    #{serialNumber}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    Scan to book this bike
                </p>
            </div>

            {/* print button for admin */}
            {showPrint && (
                <button
                onClick={handlePrint}
                className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] hover:underline">
                     🖨️ Print QR Label
                </button>
            )}
        </div>
    );

}