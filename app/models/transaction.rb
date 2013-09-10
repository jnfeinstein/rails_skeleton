# == Schema Information
#
# Table name: transactions
#
#  id         :integer          not null, primary key
#  amount     :float            default(0.0)
#  created_at :datetime
#  updated_at :datetime
#  user_id    :integer
#

class Transaction < ActiveRecord::Base
  belongs_to :user, inverse_of: :transactions
  validates :user_id, presence: true
  after_create :do_after_create

  def do_after_create
    self.user.added_new_transaction(self)
  end
end
