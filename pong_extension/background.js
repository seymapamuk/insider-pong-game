var contextMenus = {};

contextMenus.createPongGame = 
    chrome.contextMenus.create(
        {"title":"Pong Game"
        },
        function (){
            if(chrome.runtime.lastError){
                console.error(chrome.runtime.lastError.message);
            }
        }
    );

chrome.contextMenus.onClicked.addListener(contextMenuHandler);

function contextMenuHandler(info, tab){
    if(info.menuItemId === contextMenus.createPongGame){
        chrome.tabs.executeScript({file: "jquery-3.5.1.min.js"}, function(){
            chrome.tabs.executeScript({file: "pong.js"});
        });
    }
}
