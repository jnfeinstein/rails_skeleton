class AddTimeToBujit < ActiveRecord::Migration
  def change
    add_column :bujits, :last_added_at, :datetime
    add_column :bujits, :interval, :integer, default: 86400
  end
end
