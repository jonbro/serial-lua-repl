var port = undefined;
const encoder = new TextEncoder();

async function openPort()
{
  if ("serial" in navigator) {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    // Listen to data coming from the serial device.
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock();
        break;
      }
      
      // this arbitrarily linebreaks - don't like that
      console.log(value);
    }
  }  
  else
    {
      console.log("serial not supported");
    }
}
window.onload = function()
{
  document.getElementById("connectButton").addEventListener("click", openPort);  
  document.getElementById("runButton").addEventListener("click", function(){
    if(port?.writable == null)
      {
        console.warn("no writable port");
        return;
      }
    const writer = port.writable.getWriter();
    writer.write(encoder.encode(editor.getValue()+"\003"));
  });  
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/lua");  
}
