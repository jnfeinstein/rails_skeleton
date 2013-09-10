# == Schema Information
#
# Table name: transactions
#
#  id         :integer          not null, primary key
#  bank_id    :integer
#  amount     :float            default(0.0)
#  created_at :datetime
#  updated_at :datetime
#

class Transaction < ActiveRecord::Base
  belongs_to :bank, inverse_of: :transactions
end
