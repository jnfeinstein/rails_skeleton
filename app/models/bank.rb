# == Schema Information
#
# Table name: banks
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  total      :float            default(0.0)
#  created_at :datetime
#  updated_at :datetime
#

class Bank < ActiveRecord::Base
  belongs_to :user, inverse_of: :bank
  validates :user_id, presence: true

  def add_to_total(amount)
    self.total += amount
  end

  def subtract_from_total(amount)
    self.total -= amount
  end

  def apply_new_transaction(transaction)
    case transaction.creator
      when self.user
        self.subtract_from_total(transaction.amount)
      when self.user.bujit
        self.add_to_total(transaction.amount)
    end
    self.save
  end
end
