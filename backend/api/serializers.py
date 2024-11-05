from rest_framework import serializers
from .models import User, Group, Transaction, Invite
from django.contrib.auth.password_validation import validate_password

# serializer checks to make sure all data is correct before being sent to model
# Note: fields = '__all__' can be used if all fields need to be serialized

class UserSerializer(serializers.ModelSerializer):    
    class Meta:
        model = User
        # The fields var contains all fields we want to serialize when accepting or returning new user
        fields = ["id", "email", "password", "display_name"]
        # ensures that password will be accepted when a new user is created but that we won't return the password
        extra_kwargs = {
                "password": {"write_only": True},
                "email": {"required": True},
                "display_name": {"required": True}
            }

    # ensures that the password passes the checks within the settings.py
    # TODO add second password for verification
    def validate(self, attrs):
        password = attrs.get('password')
        validate_password(password)  # Ensures password is validated
        return attrs
    
    # method called when we want to create new version of user
    # we accept validated data which has already passed the checks in the serializer
    def create(self, validated_data):
        # we assign the user var and we pass all data to the User object
        user = User.objects.create_user(**validated_data)
        return user
    
class GroupSerializer(serializers.ModelSerializer):
    # I need to double check that this is actually read_only
    # members = UserSerializer(read_only=True, many=True)
    members = UserSerializer(many=True)

    class Meta:
        model = Group
        fields = ["group_id", "group_name", "description", "group_owner_id", "members"]
        extra_kwargs = {"group_owner_id": {"read_only": True}}

class TransactionSerializer(serializers.ModelSerializer):
    # allows for the group name of a transaction to be included
    group_name = serializers.CharField(source='group_id.group_name', read_only=True)


    class Meta:
        model = Transaction
        fields = ["transaction_id", "category", "amount", "description", "start_date", "end_date", "is_recurrent", "frequency", "group_id", "group_name"]
        extra_kwargs = {"group_id": {"read_only": True}}
 
class InviteSerializer(serializers.ModelSerializer):
    recipients = UserSerializer(read_only=True, many=True)

    class Meta:
        model = Invite
        fields = ["invite_id", "content", "sender_id", "recipients"]

        # foreign keys are set as "read_only" since they are automatically set
        # we only want the sender set by backend which is why writing is restricted
        extra_kwargs = {"sender_id": {"read_only": True}}

class LLMRequestSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=500)


class LLMCategoryResponseSerializer(serializers.Serializer):
    situations = serializers.ListField(child=serializers.CharField())
    subject = serializers.CharField()

# differs from transaction serializer because we don't need all the information that we do for normal transactions here
class LLMTransactionResponseSerializer(serializers.Serializer):
    category = serializers.CharField()
    amount = serializers.FloatField()
    description = serializers.CharField()
    date = serializers.DateField()