import { loadRes } from "../utils/utils";


export default class Utils {
    // (按钮节点，父节点，父节点组件，父节点方法)
    addClickEvent(node: cc.Node, target: cc.Node, component: string, handler: string) {
        const eventHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        eventHandler.target = target
        eventHandler.component = component
        eventHandler.handler = handler

        const clickEvent = node.getComponent(cc.Button).clickEvents
        let isEvent = false
        for(let i = 0; i < clickEvent.length; i++) {
            let event: cc.Component.EventHandler = clickEvent[i]
            if(event) {
                if(event.component == null) {
                    clickEvent.slice(i, 1)
                }
                // 按钮事件去重处理
                if(event.component == component && event.target == target && event.handler == handler) {
                    isEvent = true
                }
            }
        }
        if(!isEvent) {
            clickEvent.push(eventHandler)
        }
    }

    addSlideEvent(node: cc.Node, target: cc.Node, component, handler) {
        const eventHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        eventHandler.target = target
        eventHandler.component = component
        eventHandler.handler = handler

        const slideEvents = node.getComponent(cc.Slider).slideEvents
        let isEvent = false
        for(let i = 0; i < slideEvents.length; i++) {
            let event: cc.Component.EventHandler = slideEvents[i]
            if(event) {
                if(event.component == null) {
                    slideEvents.slice(i, 1)
                }
                if(event.component == component && event.target == target && event.handler == handler) {
                    isEvent = true
                }
            }
        }
        if(!isEvent) {
            slideEvents.push(eventHandler)
        }
    }

    addTogglerContainerEvent(node: cc.Node, target: cc.Node, component, handler) {
        const eventHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        eventHandler.target = target
        eventHandler.component = component
        eventHandler.handler = handler

        const checkEvents = node.getComponent(cc.ToggleContainer).checkEvents
        let isEvent = false
        for(let i = 0; i < checkEvents.length; i++) {
            let event: cc.Component.EventHandler = checkEvents[i]
            if(event) {
                if(event.component == null) {
                    checkEvents.slice(i, 1)
                }
                if(event.component == component && event.target == target && event.handler == handler) {
                    isEvent = true
                }
            }
        }
        if(!isEvent) {
            checkEvents.push(eventHandler)
        }
    }

    addEscEvent(node) {
        node.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
            if(event.keyCode == cc.macro.KEY.back) {
                console.log('game end')
                cc.game.end()
            }
        })
    }

    addPrefab(callback, parentNode:cc.Node, path, ...arrComponent) {
        loadRes(path, cc.Prefab).then((res:cc.Prefab) => {
            if(res == null) {
                callback(false)
            }

            const node:cc.Node = cc.instantiate(res)
            if(arrComponent.length > 0) {
                for(let i = 0; i < arrComponent.length; i++) {
                    if(node.getComponent(arrComponent[i]) == null) {
                        node.addComponent(arrComponent[i])
                    }
                }
            }
            parentNode.addChild(node)
            node.x = 0
            node.y = 0
            callback(true)
        })
    }
}