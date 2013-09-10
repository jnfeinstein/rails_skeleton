# == Schema Information
#
# Table name: bujits
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  amount     :float            default(0.0)
#  created_at :datetime
#  updated_at :datetime
#

class Bujit < ActiveRecord::Base
  belongs_to :user, inverse_of: :bujit
  validates :user_id, presence: true

  def amount_is_not_set?
    self.amount == 0
  end
end
