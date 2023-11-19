let onchatgpt = false;
export { onchatgpt };

let chatcode = "c2stWkVoOU5NbzFuU1cxMkRJcWdHVVhUM0JsYmtGSlBOV2RDNmdWZlhGNnAyTkhPZDRa";

export async function startChat(message)
{
    //let message = $('#message').val();
    //console.log(message);
    onchatgpt = true;
  
    var words = document.querySelector('.words');
    let p = document.createElement('p');
    let texts;
    let text1 = "";
    let newtext = [];
    let chatarr = [];

    let spsp = window.speechSynthesis;
    const speechMsg = new SpeechSynthesisUtterance()
    speechMsg.rate = 1; // 속도: 0.1 ~ 10      
    speechMsg.pitch = 1; // 음높이: 0 ~ 2
    speechMsg.lang = "ko-KR";

    p.textContent = "생성중..";
    words.appendChild(p);

    let messages;
    messages = [
          { role: "system", content: "You are ChatGPT, a large language model trained by OpenAI. 답변을 한글로 번역해서 출력해 줘." }
      ];
    messages.push({ role: "user", content:'\"' + message + '\"에 대하여 최대한 도움이 되는 답변을 100자 이내로 해줘.' });

    console.log(messages);

    var es = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + atob(chatcode),
          },
          method: "POST",
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            stream: true,
          }),
        }
      );

      const reader = es.body?.pipeThrough(new TextDecoderStream()).getReader();

      while (true) {
        const res = await reader?.read();
        if (res?.done) {
          spsp.pause();
          spsp.resume();
          let text = p.textContent;
          console.log(p.textContent);
            console.log(spsp.speaking);
            console.log(newtext.length);

          speechMsg.text = newtext.join("");
          spsp.speak(speechMsg);
          onchatgpt = false;
          
          /*while(newtext.length !== 0) {
            console.log(spsp.speaking);
            //await spsp.speaking(false);
            if(!spsp.speaking) {
              speechMsg.text = newtext[0];
              newtext.shift();
              spsp.speak(speechMsg);
            }
          }*/
          break;
        }
        const jsonStrings = res?.value.match(/data: (.*)\n\n/g);

        const jsonData = jsonStrings.map((jsonString) => {
        const startIndex = jsonString.indexOf("{");
        const endIndex = jsonString.lastIndexOf("}") + 1;
        const json = jsonString.substring(startIndex, endIndex);
        let data;

        try{
          if(json){
            data = JSON.parse(json);
            if(data.choices[0].delta.finish_reason != 'stop')
            {
              let text = data.choices[0].delta.content;
              console.log(spsp.speaking);
              text1 += text;
              if((text=='.' || text==','|| text=='!'|| text=='-'|| text==':')) {
                newtext.push(text1);
                text1 = '';
                //console.log(newtext);
              }
              if(!spsp.speaking && newtext.length !== 0) {
                console.log(newtext);
                console.log(newtext[0]);
                speechMsg.text = newtext[0];
                newtext.shift();
                spsp.speak(speechMsg);
              }
              
              p.textContent = write(chatarr);
              //console.log(p.textContent);
              words.appendChild(p);
              if(text){  
                let i=0;
                while (i < text.length) {
                  chatarr.push(text.charAt(i));
                  i++;   
                  //console.log(chatarr);
                }
              }
            }
          }
        }
        catch(ex){
          //console.log('error: json');
          //console.log(json);
        }

        return data;
      });

    }
}

function write(e) {
  //console.log(e);
  let texts = e.join("");

  texts.replace(/\n/gi, '\r\n');
  //console.log(texts);

  return texts;

}

