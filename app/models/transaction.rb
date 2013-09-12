# == Schema Information
#
# Table name: transactions
#
#  id           :integer          not null, primary key
#  amount       :float            default(0.0)
#  created_at   :datetime
#  updated_at   :datetime
#  user_id      :integer
#  creator_id   :integer          not null
#  creator_type :string(255)      not null
#

class Transaction < ActiveRecord::Base
  belongs_to :user, inverse_of: :transactions
  belongs_to :creator, polymorphic: true, inverse_of: :transactions
  validates :user_id, presence: true
  validates :creator, presence: true
  after_create :do_after_create

  def do_after_create
    self.user.do_after_transaction_created(self)
  end
end
