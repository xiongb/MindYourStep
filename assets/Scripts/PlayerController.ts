import { _decorator, Component, Vec3,systemEvent,SystemEvent,EventMouse,AnimationComponent,v3,SkeletalAnimationComponent } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    private _startJump:boolean = false;
    private _jumpStep:number = 0;
    private _curJumpTime:number = 0;
    private _curJumpSpeed:number = 0;
    private _jumpTime:number = 0.1;
    private _curPos:Vec3 = v3();
    private _deltaPos:Vec3 = v3();
    private _targetPos:Vec3 = v3();
    private _isMoving :boolean = false;
    private _curMoveIndex:number = 0;
    @property({type:AnimationComponent})
    public BodyAnim:AnimationComponent = null;

    @property({type: SkeletalAnimationComponent})
    public CocosAnim: SkeletalAnimationComponent = null;
    start () {
        
    }
    reset() {
        this._curMoveIndex = 0;
    }
    setInputActive(active:boolean){
        if(active){
            systemEvent.on(SystemEvent.EventType.MOUSE_UP,this.onMouseUp,this);
        }else{
            systemEvent.off(SystemEvent.EventType.MOUSE_UP,this.onMouseUp,this);
        }
    }
    onMouseUp(event){
        if(event.getButton() === 0){
            this.jumpByStep(1)
        }else if(event.getButton() === 2){
            this.jumpByStep(2)
        }
    }

    jumpByStep(step:number){
        if(this._isMoving) return;

        this._curMoveIndex += step;

        this.CocosAnim.getState('cocos_anim_jump').speed = 3.5; //跳跃动画时间比较长，这里加速播放
        this.CocosAnim.play('cocos_anim_jump'); //播放跳跃动画

        if(step === 1){
            //this.BodyAnim.play('oneStep');
        }else{
            this.BodyAnim.play('twoStep');
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep/this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos,this._curPos,v3(this._jumpStep,0,0));
        this._isMoving = true;
    }

    onOnceJumpEnd(){
        this._isMoving = false;
        this.CocosAnim.play('cocos_anim_idle');
        this.node.emit('JumpEnd', this._curMoveIndex);
    }
    update (deltaTime: number) {
        // Your update function goes here.
        if(this._startJump){
            this._curJumpTime += deltaTime;
            if(this._curJumpTime > this._jumpTime){
                this.node.setPosition(this._targetPos)
                this._startJump = false;
                this.onOnceJumpEnd();
            }else{
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos,this._curPos,this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }
}
