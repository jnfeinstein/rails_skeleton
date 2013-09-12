# == Schema Information
#
# Table name: bujits
#
#  id            :integer          not null, primary key
#  user_id       :integer
#  amount        :float            default(0.0)
#  created_at    :datetime
#  updated_at    :datetime
#  last_added_at :datetime
#  interval      :integer          default(86400)
#

class Bujit < ActiveRecord::Base
  has_many :transactions, as: :creator
  belongs_to :user, inverse_of: :bujit
  validates :user_id, presence: true

  def amount_is_not_set?
    self.amount == 0
  end

  def never_added?
    self.last_added_at.nil?
  end

  def should_be_added?
    (self.last_added_at + self.interval) < Time.now
  end

  def add
    self.user.build_new_transaction({'amount' => self.amount}, self).save
    self.last_added_at = Time.now
    self.save
  end
end
