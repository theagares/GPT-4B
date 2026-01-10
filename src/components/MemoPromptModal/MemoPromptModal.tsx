import { useNavigate } from 'react-router-dom'
import './MemoPromptModal.css'

type MemoPromptModalProps = {
  cardName: string
  cardId: string | number
  onClose: () => void
}

const MemoPromptModal = ({ cardName, cardId, onClose }: MemoPromptModalProps) => {
  const navigate = useNavigate()

  const handleYes = () => {
    onClose()
    navigate(`/memo?businessCardId=${cardId}`)
  }

  const handleNo = () => {
    onClose()
  }

  return (
    <div className="memo-prompt-overlay" onClick={handleNo}>
      <div className="memo-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="memo-prompt-content">
          <p className="memo-prompt-text">
            {cardName}님에 대한 사소한 정보라도,<br />
            메모를 하면 관계 관리 및 선물 추천에 도움이 돼요.<br />
            메모를 입력하러 갈까요?
          </p>
        </div>
        <div className="memo-prompt-buttons">
          <button
            type="button"
            className="memo-prompt-button memo-prompt-button-yes"
            onClick={handleYes}
          >
            예
          </button>
          <button
            type="button"
            className="memo-prompt-button memo-prompt-button-no"
            onClick={handleNo}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  )
}

export default MemoPromptModal
