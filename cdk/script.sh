# Assuming the ID is the first command line argument
ID=$1

# Your script logic using the ID
echo "Processing ID: $ID"

ITEM= $(aws dynamodb get-item \
    --table-name FovusCodingGameStack \
    --key '{"id": {"S": "'"$ID"'"}}')

echo "$ITEM" | jq '.'


S3_PATH=$(echo "$ITEM" | jq -r '.s3Path.S')


INPUT_TEXT = $(echo "$ITEM" | jq -r '.inputText.S')


aws s3 cp "$S3_PATH" .

# Append the input text to the downloaded file
echo "$INPUT_TEXT" >> "$(basename "$S3_PATH")"

echo "Text '$INPUT_TEXT' appended to file '$(basename "$S3_PATH")'"


# NEW_FILE_NAME="$(basename "$S3_PATH")_output.txt"
# mv "$S3_PATH" "$NEW_FILE_NAME"
# echo "File '$S3_PATH' renamed to '$NEW_FILE_NAME'"


# Upload the modified file back to S3
aws s3 cp "$(basename "$S3_PATH")" "$S3_PATH"

# Update the DynamoDB item with the new information
aws dynamodb update-item \
    --table-name YourDynamoDBTableName \
    --key '{"id": {"S": "'"$ID"'"}}' \
    --update-expression "SET outputFile = :S3_PATH" \
    --expression-attribute-values '{":outputFile": {"S": "'"$S3_PATH"'"}}'

echo "File '$(basename "$S3_PATH")' uploaded to S3 and DynamoDB item updated"