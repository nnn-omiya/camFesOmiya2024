class blockUI
{
    static #getOverlayElement()
    {
        return document.querySelector(".block_ui--overlay");
    }
    
    static #existsOverlayElement()
    {
        return !!(blockUI.#getOverlayElement());
    }
    
    static #removeOverlayElementFromBodyIfExists()
    {
        if(!blockUI.#existsOverlayElement())
        {
            return;
        }
        
        const overlay_element = blockUI.#getOverlayElement();
        overlay_element.remove();
    }
    
    static #addOverlayElementToBodyIfNotExists()
    {
        if(blockUI.#existsOverlayElement())
        {
            return;
        }

        const overlay_wrapper = document.createElement("div");
        overlay_wrapper.innerHTML = `
        <div class="block_ui--overlay">
            <div class="block_ui--spinner_wrapper">
                <span class="block_ui--spinner"></span>
            </div>
        </div>`.replace(/\n */g, "");
        
        document.getElementsByTagName("body")[0].appendChild(overlay_wrapper.firstChild);
    }
    
    static #handler = (e) =>
    {
        e.preventDefault();
    }

    //キー操作による入力を無効化する
    static #blockKeyInteractive(is_block = true)
    {
        const event_key= ["mousedown","mouseup","keydown","keypress","keyup","touchstart","touchend","touchmove"];
        for(const one_event_name of event_key)
        {
            if(is_block)
            {
                document.addEventListener(one_event_name, blockUI.#handler);
            }
            else
            {
                document.removeEventListener(one_event_name, blockUI.#handler);
            }
        }
    }

    static showOverlay(on_finish_func)
    {
        blockUI.#addOverlayElementToBodyIfNotExists();
        blockUI.#blockKeyInteractive(true);
        const overlay_element = blockUI.#getOverlayElement();
        const animation = overlay_element.animate([{opacity:0}, {opacity:1}], 300);
        if(typeof(on_finish_func) === "function")
        {
            animation.onfinish = on_finish_func;
        }
    }

    static closeOverlay(on_finish_funcs)
    {
        if(!blockUI.#existsOverlayElement())
        {
            return;
        }
        
        const overlay_element = blockUI.#getOverlayElement();
        blockUI.#blockKeyInteractive(false);
        const animation = overlay_element.animate([{opacity:1}, {opacity:0}], 300);
        animation.onfinish = () =>
        {
            this.#removeOverlayElementFromBodyIfExists();
            if(typeof(on_finish_funcs) === "function")
            {
                on_finish_funcs();
            }
        };
    }
    
    static showOverlayAsync()
    {
        return new Promise(async function(resolve, _reject)
        {
            blockUI.showOverlay(function()
            {
                resolve();
            })
        });
    }

    static closeOverlayAsync()
    {
        return new Promise(async function(resolve, _reject)
        {
            blockUI.closeOverlay(function()
            {
                resolve();
            })
        });
    }
}