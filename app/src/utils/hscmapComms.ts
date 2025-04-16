export function initializeIframeCommunication(
    iframe: HTMLIFrameElement,
    windowId: string,
    onMessage: (msg: any) => void
  ): () => void {
    const channel = new MessageChannel();
    let port: MessagePort | null = null;
  
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'hscmap/jupyter/handshake') {
        // Ignore handshake responses
        return;
      }
      onMessage(event.data);
    };
  
    channel.port1.onmessage = handleMessage;
    port = channel.port1;
  
    // Send handshake to iframe
    iframe.contentWindow!.postMessage(
      { type: 'hscmap/jupyter/handshake', port: channel.port2 },
      '*',
      [channel.port2]
    );
  
    // Function to send messages to iframe
    const sendToIframe = (msg: any) => {
      if (port) {
        port.postMessage(msg);
      }
    };
  
    // Example: Send initial sync message (customize as needed)
    sendToIframe({
      type: 'sync_from_kernel',
      args: { windowId },
    });
  
    return () => {
      channel.port1.close();
      channel.port2.close();
      port = null;
    };
  }