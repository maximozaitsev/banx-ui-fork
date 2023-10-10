import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Modal } from '@banx/components/modals/BaseModal'

import styles from './SubscribeNotificationsModal.module.less'

interface SubscribeNotificationsModalProps {
  title: string
  message: string
  onActionClick: () => void
  onCancel: () => void
}

export const SubscribeNotificationsModal: FC<SubscribeNotificationsModalProps> = ({
  title,
  message,
  onCancel,
  onActionClick,
}) => {
  return (
    <Modal open centered onCancel={onCancel} maskClosable={false} width={572} footer={false}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.content}>{message}</p>
      <Button className={styles.actionBtn} onClick={onActionClick}>
        Notify me
      </Button>
    </Modal>
  )
}

export const createLoanSubscribeNotificationsTitle = (loansAmount = 1) => {
  if (loansAmount > 1) {
    return `You have successfully took ${loansAmount} loans`
  }

  return `You have successfully took the loan`
}

export const createLoanSubscribeNotificationsContent = () =>
  "Please use the notifications so that you don't forget to repay your loans on time"

export const createRefinanceSubscribeNotificationsTitle = (loansAmount = 1) => {
  if (loansAmount > 1) {
    return `You have successfully refinanced ${loansAmount} loans`
  }

  return 'You have successfully refinanced the loan'
}

export const createRefinanceSubscribeNotificationsContent = () =>
  'Please use the notifications to check the status of your offers'
